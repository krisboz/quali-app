const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const db = require('../db');

/**
 * Get all inspections (no filters)
 */
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM inspection`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(rows);
  });
});

/**
 * Search inspections with filters
 * Example: /api/inspections/search?auftragsnummer=12345&lieferant=ABC
 */
router.get('/search', authenticateToken, (req, res) => {
  const filters = req.query;
  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ message: "At least one filter parameter is required." });
  }

  const conditions = Object.keys(filters).map(key => `${key} LIKE ?`).join(" AND ");
  const values = Object.values(filters).map(value => `%${value}%`);

  const sql = `SELECT * FROM inspection WHERE ${conditions}`;

  db.all(sql, values, (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(rows);
  });
});




/**
 * Update an inspection row
 */
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "ID and at least one field are required for update." });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    values.push(id);

    const sql = `UPDATE inspection SET ${fields} WHERE id = ?`;

    db.run(sql, values, function (err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ message: "Database error", error: err });
      }
      db.run("COMMIT");
      res.json({ message: "Row updated successfully", changes: this.changes });
    });
  });
});

/**
 * Delete an inspection row
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM inspection WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (this.changes === 0) return res.status(404).json({ message: "Row not found" });
    res.json({ message: "Row deleted successfully" });
  });
});

/**
 * Get inspections by auftragsnummer
 */
router.get('/by-auftragsnummer/:auftragsnummer', authenticateToken, (req, res) => {
  const { auftragsnummer } = req.params;

  if (!auftragsnummer) {
    return res.status(400).json({ message: "Missing auftragsnummer parameter." });
  }

  db.all(`SELECT * FROM inspection WHERE auftragsnummer = ?`, [auftragsnummer], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(rows);
  });
});

module.exports = router;
