const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { db } = require("../db");

router.post("/", authenticateToken, (req, res) => {
  try {
    let data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty data received" });
    }

    // Step 1: Remove rows where "Artikel-Nr." is "01-TCGoldschmiede"
    data = data.filter((row) => row["Artikel-Nr."] !== "01-TCGoldschmiede");

    // Step 2: Remove rows where "Artikel-Nr." is undefined or doesn't start with "01"
    data = data.filter(
      (row) => row["Artikel-Nr."] && row["Artikel-Nr."].startsWith("01")
    );

    if (data.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid data left after initial filtering." });
    }

    // Step 3: Remove intra-batch duplicates
    const seenInBatch = new Set();
    let batchDuplicates = 0;
    data = data.filter((row) => {
      const key = `${row["Beleg"]}|${row["Firma"]}|${row[" Artikel-Nr. fertig"]}`;
      if (seenInBatch.has(key)) {
        batchDuplicates++;
        return false;
      }
      seenInBatch.add(key);
      return true;
    });

    if (data.length === 0) {
      return res.status(400).json({
        message: "No valid data after removing intra-batch duplicates.",
      });
    }

    // Step 4: Check existing duplicates in the database
    const keys = Array.from(seenInBatch).map((k) => {
      const [beleg, firma, artikel] = k.split("|");
      return { beleg, firma, artikel };
    });

    // Split keys into chunks to avoid SQL parameter limit
    const chunkSize = 300; // Adjust based on SQLITE_LIMIT_VARIABLE_NUMBER (default 999)
    const keyChunks = [];
    for (let i = 0; i < keys.length; i += chunkSize) {
      keyChunks.push(keys.slice(i, i + chunkSize));
    }

    let existingKeys = new Set();
    let processedChunks = 0;

    const checkChunks = () => {
      if (processedChunks >= keyChunks.length) {
        // All chunks processed, proceed to filter data
        const newData = data.filter((row) => {
          const key = `${row["Beleg"]}|${row["Firma"]}|${row[" Artikel-Nr. fertig"]}`;
          return !existingKeys.has(key);
        });

        const dbDuplicates = data.length - newData.length;
        const totalDuplicates = batchDuplicates + dbDuplicates;
        console.log(
          `Found ${totalDuplicates} duplicate rows (${batchDuplicates} in batch, ${dbDuplicates} in database).`
        );

        if (newData.length === 0) {
          return res.status(400).json({ message: "All data is duplicate." });
        }

        //Handle
        function normalizeTermin(termin) {
          if (/^\d+$/.test(termin)) {
            return convertExcelSerialToDate(Number(termin));
          }
          return termin;
        }

        // Proceed to insert newData
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          const stmt = db.prepare(
            `INSERT INTO auswertungen 
            ("Beleg", "Firma", " Werkauftrag", "Termin", "Artikel-Nr.", " Artikel-Nr. fertig", 
             "Beschreibung", " Beschreibung 2", "urspr. Menge", "Menge offen", 
             "Einzelpreis", "G-Preis", "Farbe", "Größe") 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          );

          try {
            console.log({ newData });
            for (const row of newData) {
              stmt.run(
                row["Beleg"],
                row["Firma"],
                row[" Werkauftrag"],
                normalizeTermin(row["Termin"]),
                row["Artikel-Nr."],
                row[" Artikel-Nr. fertig"],
                row["Beschreibung"],
                row[" Beschreibung 2"],
                row["urspr. Menge"],
                row["Menge offen"],
                row["Einzelpreis"],
                row["G-Preis"],
                row["Farbe"],
                row["Größe"]
              );
            }
            stmt.finalize();
            db.run("COMMIT");
            res.json({
              message: "Filtered Auswertungen data uploaded successfully.",
              duplicates: totalDuplicates,
            });
          } catch (error) {
            db.run("ROLLBACK");
            console.error("Error inserting data:", error);
            res.status(500).json({ message: "Database insertion error" });
          }
        });
        return;
      }

      const chunk = keyChunks[processedChunks];
      const placeholders = chunk.map(() => "(?, ?, ?)").join(", ");
      const query = `
        SELECT Beleg, Firma, " Artikel-Nr. fertig" 
        FROM auswertungen 
        WHERE (Beleg, Firma, " Artikel-Nr. fertig") IN (${placeholders})
      `;
      const params = chunk.flatMap((k) => [k.beleg, k.firma, k.artikel]);

      db.all(query, params, (err, rows) => {
        if (err) {
          console.error("Error checking duplicates:", err);
          return res
            .status(500)
            .json({ message: "Error checking for duplicates" });
        }

        rows.forEach((row) => {
          const key = `${row.Beleg}|${row.Firma}|${row[" Artikel-Nr. fertig"]}`;
          existingKeys.add(key);
        });

        processedChunks++;
        checkChunks();
      });
    };

    checkChunks();
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", authenticateToken, (req, res) => {
  let {
    beleg,
    firma,
    werkauftrag,
    artikelnr,
    termin,
    terminFrom,
    terminTo,
    artikelnrfertig,
    page = 1,
    limit = 100,
  } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let params = [];

  if (beleg) {
    whereClauses.push('"Beleg" LIKE ?');
    params.push(`%${beleg}%`);
  }
  if (firma) {
    whereClauses.push('"Firma" LIKE ?');
    params.push(`%${firma}%`);
  }
  if (werkauftrag) {
    whereClauses.push('"Werkauftrag" LIKE ?');
    params.push(`%${werkauftrag}%`);
  }
  if (artikelnr) {
    whereClauses.push('"Artikel-Nr." LIKE ?');
    params.push(`%${artikelnr}%`);
  }
  if (artikelnrfertig) {
    whereClauses.push('"Artikel-Nr. fertig" LIKE ?');
    params.push(`%${artikelnrfertig}%`);
  }

  // Filter by exact date if provided
  if (termin) {
    const [year, month, day] = termin.split("-");
    const formatted = `${day}.${month}.${year}`;
    whereClauses.push('"Termin" = ?');
    params.push(formatted);
  }

  // Handle date range filtering
  if (terminFrom && terminTo) {
    whereClauses.push(`
      DATE(
        SUBSTR("Termin", 7, 4) || '-' || SUBSTR("Termin", 4, 2) || '-' || SUBSTR("Termin", 1, 2)
      ) BETWEEN DATE(?) AND DATE(?)
    `);
    params.push(terminFrom, terminTo); // now already in YYYY-MM-DD
  }

  const whereClause = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  const sql = `
    SELECT * 
    FROM auswertungen 
    ${whereClause} 
    ORDER BY 
      STRFTIME('%Y-%m-%d', 
        SUBSTR("Termin", 7, 4) || '-' || 
        SUBSTR("Termin", 4, 2) || '-' || 
        SUBSTR("Termin", 1, 2)
      ) DESC 
    LIMIT ? OFFSET ?;
  `;

  const countSql = `SELECT COUNT(*) as total FROM auswertungen ${whereClause}`;

  db.all(sql, [...params, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });

    db.get(countSql, params, (countErr, countRow) => {
      if (countErr) return res.status(500).json({ message: "Database error" });

      res.json({
        rows,
        total: countRow.total,
        page,
        limit,
      });
    });
  });
});

router.get("/diamond_items", authenticateToken, (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year parameters are required",
      });
    }

    // Pad month to 2 digits and create search pattern
    const paddedMonth = month.padStart(2, "0");
    const searchPattern = `%.${paddedMonth}.${year}`;

    const sql = `SELECT * FROM auswertungen WHERE "Termin" LIKE ?`;

    db.all(sql, [searchPattern], (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      // Filter items with "-p-" or "Cl" in Artikel-Nr. fertig (case-insensitive)
      const filteredItems = rows.filter((row) => {
        const artikelNr = row[" Artikel-Nr. fertig"]?.toLowerCase() || "";
        return (
          artikelNr.includes("-p-") ||
          artikelNr.includes("-cl-") ||
          artikelNr.includes("-prg") ||
          artikelNr.includes("-pyg") ||
          artikelNr.includes("-pwg") ||
          artikelNr.includes("-pl-")
        );
      });

      res.json({
        success: true,
        month: paddedMonth,
        year,
        count: filteredItems.length,
        items: filteredItems,
      });
    });
  } catch (error) {
    console.error("Error in diamond_items endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
