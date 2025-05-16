const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { db } = require("../db");

// GET: all, filter by id, artikelnr, or status
router.get("/", authenticateToken, (req, res) => {
  const { artikelnr, id, status } = req.query;
  const params = [];
  const conditions = [];

  if (id) {
    conditions.push("id = ?");
    params.push(id);
  }
  if (artikelnr) {
    conditions.push("artikelnr = ?");
    params.push(artikelnr);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM stichproben ${whereClause}`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
});

// POST: create new stichprobe
router.post("/", authenticateToken, (req, res) => {
  const data = req.body;
  console.log("data getting passed", data)

  const requiredFields = ["artikelnr", "firma", "orderNumber", "status", "mitarbeiter"];
  for (const field of requiredFields) {
    if (!data[field]) {
      return res.status(400).json({ message: `Missing field: ${field}` });
    }
  }

  const sql = `
    INSERT INTO stichproben (
      artikelnr, firma, orderNumber, status, mitarbeiter,
      allgemein_checks, allgemein_remarks,
      oberflaeche_checks, oberflaeche_remarks,
      masse_checks, masse_remarks,
      mechanik_checks, mechanik_remarks,
      steine_checks, steine_remarks,
      weiter_checks, weiter_remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.artikelnr,
    data.firma,
    data.orderNumber,
    data.status,
    data.mitarbeiter,
    data.allgemein_checks || null,
    data.allgemein_remarks || null,
    data.oberflaeche_checks || null,
    data.oberflaeche_remarks || null,
    data.masse_checks || null,
    data.masse_remarks || null,
    data.mechanik_checks || null,
    data.mechanik_remarks || null,
    data.steine_checks || null,
    data.steine_remarks || null,
    data.weiter_checks || null,
    data.weiter_remarks || null,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ message: "Insert failed" });
    }
    res.status(201).json({ message: "Inserted", id: this.lastID });
  });
});

// PUT: update existing by ID
router.put("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const data = req.body;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  const updates = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(data);

  const sql = `UPDATE stichproben SET ${updates} WHERE id = ?`;

  db.run(sql, [...values, id], function (err) {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ message: "Update failed" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "No record found" });
    }
    res.json({ message: "Updated", id });
  });
});

// DELETE: remove by ID
router.delete("/:id", authenticateToken, (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM stichproben WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ message: "Delete failed" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "No record found" });
    }
    res.json({ message: "Deleted", id });
  });
});

module.exports = router;
