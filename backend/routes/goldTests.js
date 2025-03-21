// routes/goldTests.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { db } = require('../db');

// POST - Create new gold test entry
router.post('/', authenticateToken, (req, res) => {
  const { lieferant, farbe, test_month, bestellnr, bemerkung } = req.body;

  if (!lieferant || !farbe || !test_month || !bestellnr) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `INSERT INTO gold_tests 
    (lieferant, farbe, test_month, bestellnr, bemerkung) 
    VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [lieferant, farbe, test_month, bestellnr, bemerkung], 
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ 
            message: "Test for this supplier/color/month already exists" 
          });
        }
        return res.status(500).json({ message: err.message });
      }
      res.json({ 
        id: this.lastID,
        message: "Gold test recorded successfully" 
      });
  });
});

// GET - Retrieve gold tests with filtering
router.get('/', authenticateToken, (req, res) => {
  const { lieferant, farbe, year, month, page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let params = [];

  if (lieferant) {
    whereClauses.push("lieferant = ?");
    params.push(lieferant);
  }
  if (farbe) {
    whereClauses.push("farbe = ?");
    params.push(farbe);
  }
  if (year && month) {
    whereClauses.push("test_month = ?");
    params.push(`${year}-${month.padStart(2, '0')}-01`);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM gold_tests ${where} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) as total FROM gold_tests ${where}`;

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
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
});

// GET - Check missing tests for a specific month
router.get('/missing', authenticateToken, (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ message: "Year and month parameters required" });
  }

  const testMonth = `${year}-${month.padStart(2, '0')}-01`;
  const suppliers = ['Adoma', 'Breuning', 'Sisti', 'Rösch', 'Schofer'];
  const colors = ['RG', 'YG', 'WG'];

  const sql = `
    SELECT lieferant, farbe 
    FROM gold_tests 
    WHERE test_month = ?
  `;

  db.all(sql, [testMonth], (err, existingTests) => {
    if (err) return res.status(500).json({ message: err.message });

    const missing = [];
    suppliers.forEach(supplier => {
      colors.forEach(color => {
        if (!existingTests.some(t => t.lieferant === supplier && t.farbe === color)) {
          missing.push({ lieferant: supplier, farbe: color });
        }
      });
    });

    res.json({
      month: testMonth,
      missingTests: missing,
      totalMissing: missing.length
    });
  });
});

// PUT - Update a test entry
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { bemerkung } = req.body;

  if (!bemerkung) {
    return res.status(400).json({ message: "Bemerkung is required" });
  }

  const sql = `UPDATE gold_tests SET bemerkung = ? WHERE id = ?`;
  
  db.run(sql, [bemerkung, id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ message: "Test entry not found" });
    }
    res.json({ message: "Test updated successfully" });
  });
});

// DELETE - Remove a test entry
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM gold_tests WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ message: "Test entry not found" });
    }
    res.json({ message: "Test deleted successfully" });
  });
});

module.exports = router;