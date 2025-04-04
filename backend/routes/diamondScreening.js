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

// Add these promise-based wrappers at the top of your routes file
const dbRun = (db, sql, params) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    err ? reject(err) : resolve(this);
  });
});

const dbGet = (db, sql, params) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    err ? reject(err) : resolve(row);
  });
});

// Updated batch endpoint
router.post("/batch", authenticateToken, async (req, res) => {
  const screenings = req.body;

  if (!Array.isArray(screenings)) {
    return res.status(400).json({ message: "Payload must be an array" });
  }

  try {
    await dbRun(db, "BEGIN TRANSACTION", []);

    const failedItems = [];
    let insertedCount = 0;
    let updatedCount = 0;

    for (const s of screenings) {
      try {
        // Validate required fields
        const requiredFields = ['liefertermin', 'lieferant', 'bestellnr', 'artikelnr', 'quantity', 'ursprMenge'];
        const missingFields = requiredFields.filter(field => !s[field]);
        if (missingFields.length > 0) {
          failedItems.push({ ...s, reason: `Missing fields: ${missingFields.join(', ')}` });
          continue;
        }

        // Check existing quantity
        const existing = await dbGet(
          db,
          `SELECT quantity FROM diamond_screenings 
           WHERE bestellnr = ? AND artikelnr = ? AND liefertermin = ?`,
          [s.bestellnr, s.artikelnr, s.liefertermin]
        );

        // Quantity validation
        const currentTotal = existing?.quantity || 0;
        const potentialTotal = currentTotal + s.quantity;
        if (potentialTotal > s.ursprMenge) {
          failedItems.push({
            ...s,
            reason: `Would exceed original quantity (${potentialTotal}/${s.ursprMenge})`
          });
          continue;
        }

        // Update or insert
        if (existing) {
          await dbRun(
            db,
            `UPDATE diamond_screenings 
             SET quantity = quantity + ?, bemerkung = ?
             WHERE bestellnr = ? AND artikelnr = ? AND liefertermin = ?`,
            [s.quantity, s.bemerkung || null, s.bestellnr, s.artikelnr, s.liefertermin]
          );
          updatedCount++;
        } else {
          await dbRun(
            db,
            `INSERT INTO diamond_screenings 
             (liefertermin, lieferant, bestellnr, artikelnr, quantity, bemerkung)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [s.liefertermin, s.lieferant, s.bestellnr, s.artikelnr, s.quantity, s.bemerkung || null]
          );
          insertedCount++;
        }

      } catch (error) {
        failedItems.push({ 
          ...s, 
          reason: `Database error: ${error.message}` 
        });
      }
    }

    if (failedItems.length > 0) {
      await dbRun(db, "ROLLBACK", []);
      return res.status(400).json({
        message: `Partial failure: ${failedItems.length} items rejected`,
        failedItems,
        insertedCount: 0,
        updatedCount: 0
      });
    }

    await dbRun(db, "COMMIT", []);
    res.json({
      message: `Successfully processed ${insertedCount + updatedCount} items`,
      insertedCount,
      updatedCount
    });

  } catch (error) {
    await dbRun(db, "ROLLBACK", []);
    console.error('Database error:', error);
    res.status(500).json({ 
      message: 'Transaction failed',
      error: error.message 
    });
  }
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
    params.push(liefertermin); // This should be in 'YYYY-MM' format
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

// DELETE - Remove a diamond screening entry by ID
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Missing ID parameter" });
  }

  const sql = `DELETE FROM diamond_screenings WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Entry not found or already deleted" });
    }

    res.json({
      message: "Entry successfully deleted",
      deletedId: id,
    });
  });
});


module.exports = router;
