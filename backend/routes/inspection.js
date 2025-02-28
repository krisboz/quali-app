const express = require('express');
const authenticateToken = require('../middleware/auth'); // Import middleware if needed
const router = express.Router();
const db = require('../db');


/**
 * Get all inspections (no filters)
 */
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM inspection`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(rows);
  });
});

/**
 * Search inspections with filters
 * Example: /api/inspections/search?auftragsnummer=12345&lieferant=ABC
 */
router.get('/search', authenticateToken, (req, res) => {
  const filters = req.query; // Get query params
  const keys = Object.keys(filters);

  if (keys.length === 0) {
    return res.status(400).json({ message: "At least one filter parameter is required." });
  }

  // Construct WHERE clause dynamically
  const conditions = keys.map(key => `${key} LIKE ?`).join(" AND ");
  const values = keys.map(key => `%${filters[key]}%`); // Wildcards for partial matches

  const sql = `SELECT * FROM inspection WHERE ${conditions}`;

  db.all(sql, values, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(rows);
  });
});

/**
 * Update an inspection row
 * Example request body:
 * {
 *   "id": 1,
 *   "liefertermin": "2025-03-01",
 *   "lieferant": "New Supplier",
 *   "mangel": "Updated issue"
 * }
 */
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "ID and at least one field are required for update." });
  }

  // Construct SET clause dynamically
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
  const values = Object.values(updates);
  values.push(id); // Add id at the end for WHERE condition

  const sql = `UPDATE inspection SET ${fields} WHERE id = ?`;

  db.run(sql, values, function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json({ message: "Row updated successfully", changes: this.changes });
  });
});

/**
 * Delete an inspection row
 * Example: DELETE /api/inspections/5
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM inspection WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Row not found" });
    }
    res.json({ message: "Row deleted successfully" });
  });
});

module.exports = router;
