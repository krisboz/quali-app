const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { db } = require("../db");

router.post("/", authenticateToken, (req, res) => {
  try {
    // Step 1: Sanitize incoming data keys (removes leading/trailing spaces in column names)
    const sanitizeKeys = (data) =>
      data.map((row) => {
        const cleanRow = {};
        for (let key in row) {
          cleanRow[key.trim()] = row[key];
        }
        return cleanRow;
      });

    let data = sanitizeKeys(req.body);

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty data received" });
    }

    // Step 2: Filter data
    data = data
      .filter((row) => row["Artikel-Nr."] !== "01-TCGoldschmiede")
      .filter((row) => row["Artikel-Nr."]?.startsWith("01"));

    if (data.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid data after initial filtering." });
    }

    // Helpers
    const normalizeTermin = (termin) => {
      return /^\d+$/.test(termin)
        ? convertExcelSerialToDate(Number(termin))
        : termin;
    };

    const normalizeNumber = (value) => {
      if (typeof value === "string") {
        return parseFloat(value.replace(/\./g, "").replace(/,/g, "."));
      }
      return value;
    };

    // Remove intra-batch duplicates using Beleg + Artikel-Nr. fertig as unique key
    const seenInBatch = new Set();
    let batchDuplicates = 0;
    data = data.filter((row) => {
      const key = `${row["Beleg"]}|${row["Artikel-Nr. fertig"]}`;
      if (seenInBatch.has(key)) {
        batchDuplicates++;
        return false;
      }
      seenInBatch.add(key);
      return true;
    });

    if (data.length === 0) {
      return res.status(400).json({ message: "No data after deduplication" });
    }

    // Check which rows already exist in DB
    const keys = Array.from(seenInBatch).map((k) => {
      const [beleg, artikel] = k.split("|");
      return { beleg, artikel };
    });

    const chunkSize = 300;
    const keyChunks = [];
    for (let i = 0; i < keys.length; i += chunkSize) {
      keyChunks.push(keys.slice(i, i + chunkSize));
    }

    let existingKeys = new Set();
    let processedChunks = 0;

    const checkChunks = () => {
      if (processedChunks >= keyChunks.length) {
        const toInsert = [];
        const toUpdate = [];

        for (const row of data) {
          const key = `${row["Beleg"]}|${row["Artikel-Nr. fertig"]}`;
          existingKeys.has(key) ? toUpdate.push(row) : toInsert.push(row);
        }

        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          try {
            const insertStmt = db.prepare(`
              INSERT INTO auswertungen 
              ("Beleg", "Firma", "Werkauftrag", "Termin", "Artikel-Nr.", "Artikel-Nr. fertig", 
              "Beschreibung", "Beschreibung 2", "urspr. Menge", "Menge offen", 
              "Einzelpreis", "G-Preis", "Farbe", "Größe") 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT("Beleg", "Artikel-Nr. fertig") DO UPDATE SET
                "Firma" = excluded."Firma",
                "Werkauftrag" = excluded."Werkauftrag",
                "Termin" = excluded."Termin",
                "Artikel-Nr." = excluded."Artikel-Nr.",
                "Beschreibung" = excluded."Beschreibung",
                "Beschreibung 2" = excluded."Beschreibung 2",
                "urspr. Menge" = excluded."urspr. Menge",
                "Menge offen" = excluded."Menge offen",
                "Einzelpreis" = excluded."Einzelpreis",
                "G-Preis" = excluded."G-Preis",
                "Farbe" = excluded."Farbe",
                "Größe" = excluded."Größe"
            `);

            for (const row of data) {
              insertStmt.run(
                row["Beleg"],
                row["Firma"],
                row["Werkauftrag"],
                normalizeTermin(row["Termin"]),
                row["Artikel-Nr."],
                row["Artikel-Nr. fertig"],
                row["Beschreibung"],
                row["Beschreibung 2"],
                normalizeNumber(row["urspr. Menge"]),
                normalizeNumber(row["Menge offen"]),
                normalizeNumber(row["Einzelpreis"]),
                normalizeNumber(row["G-Preis"]),
                row["Farbe"],
                row["Größe"]
              );
            }

            insertStmt.finalize();
            db.run("COMMIT", (err) => {
              if (err) throw err;
              res.json({
                message: "Data processed successfully",
                inserted: toInsert.length,
                updated: toUpdate.length,
                duplicates: batchDuplicates,
              });
            });
          } catch (error) {
            db.run("ROLLBACK");
            console.error("Database error:", error);
            res.status(500).json({ message: "Database operation failed" });
          }
        });
        return;
      }

      const chunk = keyChunks[processedChunks];
      const placeholders = chunk.map(() => "(?, ?)").join(", ");
      const query = `
        SELECT Beleg, "Artikel-Nr. fertig" 
        FROM auswertungen 
        WHERE (Beleg, "Artikel-Nr. fertig") IN (${placeholders})
      `;
      const params = chunk.flatMap((k) => [k.beleg, k.artikel]);

      db.all(query, params, (err, rows) => {
        if (err) {
          console.error("Duplicate check error:", err);
          return res.status(500).json({ message: "Duplicate check failed" });
        }

        rows.forEach((row) => {
          existingKeys.add(`${row.Beleg}|${row["Artikel-Nr. fertig"]}`);
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
    pagesOff,
  } = req.query;
  try {
    const usePaging = !pagesOff || pagesOff === "false";
    console.log(usePaging);

    if (usePaging) {
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
      if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        return res
          .status(400)
          .json({ message: "Invalid pagination parameters." });
      }
    }

    const offset = usePaging ? (page - 1) * limit : 0;

    const whereClauses = [];
    const params = [];

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

    if (termin) {
      const [year, month, day] = termin.split("-");
      if (!year || !month || !day) {
        return res
          .status(400)
          .json({ message: "Invalid 'termin' format. Expected YYYY-MM-DD." });
      }
      const formatted = `${day}.${month}.${year}`;
      whereClauses.push('"Termin" = ?');
      params.push(formatted);
    }

    if (terminFrom && terminTo) {
      console.log(terminFrom, terminTo)
      whereClauses.push(`
        DATE(
          SUBSTR("Termin", 7, 4) || '-' || 
          SUBSTR("Termin", 4, 2) || '-' || 
          SUBSTR("Termin", 1, 2)
        ) BETWEEN DATE(?) AND DATE(?)
      `);
      params.push(terminFrom, terminTo);
    }

    const whereClause = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const orderBy = `
      ORDER BY 
        STRFTIME('%Y-%m-%d', 
          SUBSTR("Termin", 7, 4) || '-' || 
          SUBSTR("Termin", 4, 2) || '-' || 
          SUBSTR("Termin", 1, 2)
        ) DESC
    `;

    const sql = `
      SELECT * 
      FROM auswertungen 
      ${whereClause} 
      ${orderBy}
      ${usePaging ? "LIMIT ? OFFSET ?" : ""};
    `;

    const countSql = `SELECT COUNT(*) as total FROM auswertungen ${whereClause}`;
    const sqlParams = usePaging ? [...params, limit, offset] : params;

    db.all(sql, sqlParams, (err, rows) => {
      if (err) {
        console.error("Error querying rows:", err);
        return res.status(500).json({ message: "Database query error." });
      }

      if (!usePaging) {
        return res.json({ rows, total: rows.length });
      }

      db.get(countSql, params, (countErr, countRow) => {
        if (countErr) {
          console.error("Error counting rows:", countErr);
          return res.status(500).json({ message: "Database count error." });
        }

        res.json({
          rows,
          total: countRow.total,
          page,
          limit,
        });
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error." });
  }
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
