const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { db } = require('../db');

router.post('/', authenticateToken, (req, res) => {
  try {
    let data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data received" });
    }

    // Step 1: Remove all rows where "Artikel-Nr." is exactly "01-TCGoldschmiede"
    data = data.filter(row => row["Artikel-Nr."] !== "01-TCGoldschmiede");

    // Step 2: Remove all rows where "Artikel-Nr." is undefined or does not start with "01"
    data = data.filter(row => row["Artikel-Nr."] && row["Artikel-Nr."].startsWith("01"));

    if (data.length === 0) {
      return res.status(400).json({ message: "No valid data left after filtering." });
    }

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const stmt = db.prepare(
        `INSERT OR IGNORE INTO auswertungen 
        ("Beleg", "Firma", " Werkauftrag", "Termin", "Artikel-Nr.", " Artikel-Nr. fertig", 
         "Beschreibung", " Beschreibung 2", "urspr. Menge", "Menge offen", 
         "Einzelpreis", "G-Preis", "Farbe", "Größe") 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      try {
        for (const row of data) {
          stmt.run(
            row["Beleg"],
            row["Firma"],
            row[" Werkauftrag"],
            row["Termin"],
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
        res.json({ message: 'Filtered Auswertungen data uploaded successfully.' });
      } catch (error) {
        db.run("ROLLBACK");
        console.error("Error inserting data:", error);
        res.status(500).json({ message: "Database insertion error" });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/', authenticateToken, (req, res) => {
  let { beleg, firma, werkauftrag, artikelnr, termin, artikelnrfertig, page = 1, limit = 100 } = req.query;
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
    whereClauses.push('" Werkauftrag" LIKE ?');
    params.push(`%${werkauftrag}%`);
  }
  if (artikelnr) {
    whereClauses.push('"Artikel-Nr." LIKE ?');
    params.push(`%${artikelnr}%`);
  }
  if (artikelnrfertig) {
    whereClauses.push('" Artikel-Nr. fertig" LIKE ?');
    params.push(`%${artikelnrfertig}%`);
  }
  if (termin) {
    const [year, month, day] = termin.split('-');
    const formattedTermin = `${day}.${month}.${year}`;
    whereClauses.push('"Termin" = ?');
    params.push(formattedTermin);
  }

  const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `SELECT * FROM auswertungen ${whereClause} LIMIT ? OFFSET ?`;
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

module.exports = router;
