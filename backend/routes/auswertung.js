const express = require('express');
const authenticateToken = require("../middleware/auth");

const router = express.Router();
const db = require('../db');

// POST endpoint for inserting auswertungen data
router.post('/', authenticateToken, (req, res) => {
  try {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data received" });
    }

    const stmt = db.prepare(
      `INSERT INTO auswertungen 
      ("Beleg", "Firma", "Werkauftrag", "Termin", "Artikel-Nr.", "Artikel-Nr. fertig", 
       "Beschreibung", "Beschreibung 2", "urspr. Menge", "Menge offen", "Einzelpreis", 
       "G-Preis", "Farbe", "Größe") 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );

    data.forEach(row => {
      try {
        if (!row["Artikel-Nr."]?.startsWith("01")) return; // Filter out non-"01" rows

        stmt.run(
          row["Beleg"],
          row["Firma"]?.trim(),
          row["Werkauftrag"]?.trim(),
          row["Termin"],
          row["Artikel-Nr."],
          row["Artikel-Nr. fertig"],
          row["Beschreibung"],
          row["Beschreibung 2"],
          row["urspr. Menge"],
          row["Menge offen"],
          row["Einzelpreis"],
          row["G-Preis"],
          row["Farbe"],
          row["Größe"]
        );
      } catch (error) {
        console.error("Error inserting row:", row, error);
      }
    });

    stmt.finalize();
    res.json({ message: 'Auswertungen data uploaded successfully.' });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET endpoint with filtering and pagination
router.get('/', authenticateToken, (req, res) => {
  let { beleg, firma, werkauftrag, artikelnr, termin, artikelnrfertig, page = 1, limit = 100 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1 ';
  let params = [];

  if (beleg) {
    whereClause += 'AND "Beleg" LIKE ? ';
    params.push(`%${beleg}%`);
  }
  if (firma) {
    whereClause += 'AND "Firma" LIKE ? ';
    params.push(`%${firma}%`);
  }
  if (werkauftrag) {
    whereClause += 'AND " Werkauftrag" LIKE ? ';
    params.push(`%${werkauftrag}%`);
  }
  if (artikelnr) {
    whereClause += 'AND "Artikel-Nr." LIKE ? ';
    params.push(`%${artikelnr}%`);
  }
  if (artikelnrfertig) {
    whereClause += 'AND " Artikel-Nr. fertig" LIKE ? ';
    params.push(`%${artikelnrfertig}%`);
  }
  if (termin) {
    const [year, month, day] = termin.split('-');
    const formattedTermin = `${day}.${month}.${year}`;
    whereClause += 'AND "Termin" = ? ';
    params.push(formattedTermin);
  }

  const sql = `SELECT * FROM auswertungen ${whereClause} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) as total FROM auswertungen ${whereClause}`;

  db.all(sql, [...params, limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    db.get(countSql, params, (countErr, countRow) => {
      if (countErr) {
        return res.status(500).json({ message: "Database error" });
      }
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