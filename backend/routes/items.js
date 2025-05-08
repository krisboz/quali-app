const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { db } = require("../db");

// Helper for upserting (update if exists, insert if not)
const upsertItem = `
  INSERT INTO items (
    Artikelgruppe, Artikelnummer, Bestand, Bezeichnung, Inaktiv, LetzterEK, Lieferantenname,
    Lieferfrist, MakeOrBuy, Matchcode, Mengeneinheit, "UVP - Euro ", "VK 1 - Euro",
    "verfügbar in", _ARTIKELGRUPPENEU, _BESTSELLER, _MARKETINGFOCUS,
    _PARETOCLUSTER, _REGULARREPLENISHMENT, _SILHOUETTE
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
  ON CONFLICT(Artikelnummer) DO UPDATE SET
    Artikelgruppe=excluded.Artikelgruppe,
    Bestand=excluded.Bestand,
    Bezeichnung=excluded.Bezeichnung,
    Inaktiv=excluded.Inaktiv,
    LetzterEK=excluded.LetzterEK,
    Lieferantenname=excluded.Lieferantenname,
    Lieferfrist=excluded.Lieferfrist,
    MakeOrBuy=excluded.MakeOrBuy,
    Matchcode=excluded.Matchcode,
    Mengeneinheit=excluded.Mengeneinheit,
    "UVP - Euro "=excluded."UVP - Euro ",
    "VK 1 - Euro"=excluded."VK 1 - Euro",
    "verfügbar in"=excluded."verfügbar in",
    _ARTIKELGRUPPENEU=excluded._ARTIKELGRUPPENEU,
    _BESTSELLER=excluded._BESTSELLER,
    _MARKETINGFOCUS=excluded._MARKETINGFOCUS,
    _PARETOCLUSTER=excluded._PARETOCLUSTER,
    _REGULARREPLENISHMENT=excluded._REGULARREPLENISHMENT,
    _SILHOUETTE=excluded._SILHOUETTE
`;

// POST /items/upload (bulk insert or update)
router.post("/upload", authenticateToken, (req, res) => {
  const data = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "No data provided" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    const stmt = db.prepare(upsertItem);

    try {
      for (const item of data) {
        stmt.run([
          item.Artikelgruppe,
          item.Artikelnummer,
          item.Bestand,
          item.Bezeichnung,
          item.Inaktiv,
          item.LetzterEK,
          item.Lieferantenname,
          item.Lieferfrist,
          item.MakeOrBuy,
          item.Matchcode,
          item.Mengeneinheit,
          item["UVP - Euro "],
          item["VK 1 - Euro"],
          item["verfügbar in"],
          item._ARTIKELGRUPPENEU,
          item._BESTSELLER,
          item._MARKETINGFOCUS,
          item._PARETOCLUSTER,
          item._REGULARREPLENISHMENT,
          item._SILHOUETTE,
        ]);
      }

      stmt.finalize();
      db.run("COMMIT");
      res.json({ message: "Items uploaded or updated successfully" });
    } catch (err) {
      db.run("ROLLBACK");
      console.error(err);
      res.status(500).json({ message: "Error uploading items" });
    }
  });
});

// POST /items (manual single insert/update)
router.post("/", authenticateToken, (req, res) => {
  const item = req.body;

  db.run(upsertItem, [
    item.Artikelgruppe,
    item.Artikelnummer,
    item.Bestand,
    item.Bezeichnung,
    item.Inaktiv,
    item.LetzterEK,
    item.Lieferantenname,
    item.Lieferfrist,
    item.MakeOrBuy,
    item.Matchcode,
    item.Mengeneinheit,
    item["UVP - Euro "],
    item["VK 1 - Euro"],
    item["verfügbar in"],
    item._ARTIKELGRUPPENEU,
    item._BESTSELLER,
    item._MARKETINGFOCUS,
    item._PARETOCLUSTER,
    item._REGULARREPLENISHMENT,
    item._SILHOUETTE,
  ], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error inserting item" });
    }
    res.json({ message: "Item inserted or updated", id: this.lastID });
  });
});

// GET /items (optionally filtered)
router.get("/", authenticateToken, (req, res) => {
  const filters = [];
  const params = [];

  for (const [key, value] of Object.entries(req.query)) {
    if (value) {
      filters.push(`"${key}" LIKE ?`);
      params.push(`%${value}%`);
    }
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const sql = `SELECT * FROM items ${where}`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching items" });
    }
    res.json(rows);
  });
});

// DELETE /items/:id
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error deleting item" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted" });
  });
});

// PATCH /items/:id
router.patch("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const setClause = fields.map((field) => `"${field}" = ?`).join(", ");
  const sql = `UPDATE items SET ${setClause} WHERE id = ?`;

  db.run(sql, [...values, id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating item" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Item not found or unchanged" });
    }
    res.json({ message: "Item updated" });
  });
});

module.exports = router;
