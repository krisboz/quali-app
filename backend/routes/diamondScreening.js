const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { db } = require("../db");

// POST - Create new diamond screening entry
router.post("/", authenticateToken, (req, res) => {
  const { liefertermin, lieferant, bestellnr, artikelnr, quantity, bemerkung } =
    req.body;

  if (!liefertermin || !lieferant || !bestellnr || !artikelnr || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `INSERT INTO diamond_screenings 
    (liefertermin, lieferant, bestellnr, artikelnr, quantity, bemerkung) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [liefertermin, lieferant, bestellnr, artikelnr, quantity, bemerkung],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(409).json({ message: "Duplicate bestellnr entry" });
        }
        return res.status(500).json({ message: err.message });
      }
      res.json({
        id: this.lastID,
        message: "Diamond screening recorded successfully",
      });
    }
  );
});

// GET - Retrieve diamond screenings with filtering
router.get("/", authenticateToken, (req, res) => {
  const {
    liefertermin,
    lieferant,
    bestellnr,
    artikelnr,
    page = 1,
    limit = 100,
  } = req.query;
  const offset = (page - 1) * limit;
  let whereClauses = [];
  let params = [];

  if (liefertermin) {
    whereClauses.push("strftime('%Y-%m', liefertermin) = ?");
    params.push(liefertermin);
  }
  if (lieferant) {
    whereClauses.push("lieferant LIKE ?");
    params.push(`${lieferant}%`);
  }
  if (bestellnr) {
    whereClauses.push("bestellnr LIKE ?");
    params.push(`%${bestellnr}%`);
  }
  if (artikelnr) {
    whereClauses.push("artikelnr LIKE ?");
    params.push(`%${artikelnr}%`);
  }

  const where = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";
  const sql = `SELECT * FROM diamond_screenings ${where} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) as total FROM diamond_screenings ${where}`;

  db.all(sql, [...params, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });

    db.get(countSql, params, (countErr, countRow) => {
      if (countErr) return res.status(500).json({ message: countErr.message });

      res.json({
        data: rows,
        meta: {
          total: countRow.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countRow.total / limit),
        },
      });
    });
  });
});

module.exports = router;
