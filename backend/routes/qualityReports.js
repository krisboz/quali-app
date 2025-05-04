const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const authenticateToken = require("../middleware/auth");
const { db } = require("../db");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3Client = new S3Client({
  endpoint: process.env.R2_URL,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Get all quality reports
 */
router.get("/", authenticateToken, (req, res) => {
  const { terminFrom, terminTo } = req.query;

  let whereClause = "";
  let params = [];

  if (terminFrom && terminTo) {
    whereClause = "WHERE DATE(liefertermin) BETWEEN DATE(?) AND DATE(?)";
    params = [terminFrom, terminTo];
  }

  const sql = `
    SELECT * FROM quality_reports 
    ${whereClause}
    ORDER BY DATE(liefertermin) DESC
  `;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(rows);
  });
});

/**
 * Search quality reports by auftragsnummer
 */
router.get("/search", authenticateToken, (req, res) => {
  const { auftragsnummer } = req.query;
  if (!auftragsnummer)
    return res.status(400).json({ message: "auftragsnummer is required" });

  db.all(
    "SELECT * FROM quality_reports WHERE auftragsnummer LIKE ?",
    [`%${auftragsnummer}%`],
    (err, rows) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });
      res.json(rows);
    }
  );
});

// Search by mitarbeiter (username)
router.get("/search-by-username", authenticateToken, (req, res) => {
  const { mitarbeiter } = req.query;

  if (!mitarbeiter) {
    return res
      .status(400)
      .json({ message: "Username (mitarbeiter) is required." });
  }

  const sql = `SELECT COUNT(*) AS count FROM inspection WHERE mitarbeiter LIKE ?`;
  const values = [`%${mitarbeiter}%`];

  db.get(sql, values, (err, row) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    res.json({ count: row.count });
  });
});

/**
 * Upload and insert a new quality report
 */
router.post("/", authenticateToken, upload.array("fotos"), async (req, res) => {
  const {
    liefertermin,
    lieferant,
    auftragsnummer,
    artikelnr,
    produkt,
    mangel,
    mangelgrad,
    mangelgrund,
    mitarbeiter,
    lieferantInformiertAm,
    loesung,
  } = req.body;
  const imageUrls = [];
  const dateOfInspection = new Date().toISOString().split("T")[0];

  try {
    for (const file of req.files) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename =
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      imageUrls.push(`${process.env.R2_PUBLIC_BUCKET_URL}/${filename}`);
    }
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return res.status(500).send({ message: "Error uploading images." });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const sql = `
      INSERT INTO quality_reports 
      (liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, fotos, dateOfInspection) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    db.run(
      sql,
      [
        liefertermin,
        lieferant,
        auftragsnummer,
        artikelnr,
        produkt,
        mangel,
        mangelgrad,
        mangelgrund,
        mitarbeiter,
        lieferantInformiertAm,
        loesung,
        JSON.stringify(imageUrls),
        dateOfInspection,
      ],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        db.run("COMMIT");
        res.json({
          message: "Quality report saved successfully",
          reportId: this.lastID,
        });
      }
    );
  });
});

/**
 * Delete a quality report
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM quality_reports WHERE id = ?", [id], function (err) {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (this.changes === 0)
      return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  });
});

/**
 * Update an existing quality report
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id || Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ message: "ID and at least one field are required for update." });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    values.push(id);

    const sql = `UPDATE quality_reports SET ${fields} WHERE id = ?`;

    db.run(sql, values, function (err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ message: "Database error", error: err });
      }
      db.run("COMMIT");
      res.json({ message: "Report updated successfully" });
    });
  });
});

module.exports = router;
