const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const authenticateToken = require('../middleware/auth');
const { db } = require('../db');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3Client = new S3Client({
  endpoint: process.env.R2_URL,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM quality_reports ORDER BY liefertermin DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows);
  });
});

router.get('/search', authenticateToken, (req, res) => {
  const { auftragsnummer } = req.query;
  if (!auftragsnummer) return res.status(400).json({ message: 'auftragsnummer is required' });

  db.all(
    'SELECT * FROM quality_reports WHERE auftragsnummer LIKE ?',
    [`%${auftragsnummer}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows);
    }
  );
});

router.post('/', authenticateToken, upload.array("fotos"), async (req, res) => {
  const { liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung } = req.body;
  const imageUrls = [];

  try {
    for (const file of req.files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      const imageUrl = `${process.env.R2_PUBLIC_BUCKET_URL}/${filename}`;
      imageUrls.push(imageUrl);
    }
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return res.status(500).send({ message: 'Error uploading images.' });
  }

  db.run(`INSERT INTO quality_reports (liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, fotos) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, JSON.stringify(imageUrls)],
    function(err) {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Quality report saved successfully", reportId: this.lastID });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM quality_reports WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Report deleted successfully" });
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, fotos } = req.body;

  db.run(
    `UPDATE quality_reports SET 
      liefertermin = ?,
      lieferant = ?,
      auftragsnummer = ?,
      artikelnr = ?,
      produkt = ?,
      mangel = ?,
      mangelgrad = ?,
      mangelgrund = ?,
      mitarbeiter = ?,
      lieferantInformiertAm = ?,
      loesung = ?,
      fotos = ?
    WHERE id = ?`,
    [liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, fotos, id],
    function(err) {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Report updated successfully" });
    }
  );
});

module.exports = router;