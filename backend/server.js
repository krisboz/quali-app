// Import necessary modules
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require("./middleware/auth"); // Import middleware
const multer = require("multer");
const path = require("path");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // Import from AWS SDK

const sqlite3 = require('sqlite3').verbose(); // Import SQLite3
require('dotenv').config();

// Initialize express app
const app = express();
const db = new sqlite3.Database('./database.sqlite'); // Saves to a file
// Configure multer to store files in memory
const storage = multer.memoryStorage(); // Use in-memory storage
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase the limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json()); // Parses JSON body

// Create a User table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.get(`SELECT COUNT(*) AS count FROM users`, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }
  
    if (row.count === 0) { // Only insert if the table is empty
      console.log("Seeding database with default users...");
      const stmt = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`); 
      stmt.run('kristijan.b', bcrypt.hashSync('password123', 10));
      stmt.run('vanessa.m', bcrypt.hashSync('password123', 10));
      stmt.finalize();
    }
  });

    // Create Quality Reports table
  db.run(`CREATE TABLE IF NOT EXISTS quality_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    liefertermin TEXT,
    lieferant TEXT,
    auftragsnummer TEXT,
    artikelnr TEXT,
    produkt TEXT,
    mangel TEXT,
    mangelgrad INTEGER,
    mangelgrund TEXT,
    mitarbeiter TEXT,
    lieferantInformiertAm TEXT,
    loesung TEXT,
    fotos TEXT
  )`)
   // Create Auswertungen table
   db.run(`CREATE TABLE IF NOT EXISTS auswertungen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "Beleg" TEXT,
    "Firma" TEXT,
    " Werkauftrag" TEXT,
    "Termin" TEXT,
    "Artikel-Nr." TEXT,
    " Artikel-Nr. fertig" TEXT,
    "Beschreibung" TEXT,
    " Beschreibung 2" TEXT,
    "urspr. Menge" INTEGER,
    "Menge offen" INTEGER,
    "Einzelpreis" REAL,
    "G-Preis" REAL,
    "Farbe" TEXT,
    "Größe" TEXT,
    UNIQUE("Beleg", "Artikel-Nr.")
)`);
});

// Cloudflare R2 configuration
const s3Client = new S3Client({
  endpoint: process.env.R2_URL, // Use the R2_URL from your.env file
  region: 'auto',
  credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

  


// Simple GET route to check if the server is working
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Login post initiated");

  // Find user from the database
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });

    // Send back token
    res.json({ message: 'Login successful', token });
  });
});

// Change password route (protected)
app.post("/change-password", authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const username = req.user.username; // Extract username from JWT

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in the database
  db.run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, username], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Password updated successfully" });
  });
});
// Fetch quality reports route (protected)
app.get('/quality-reports', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM quality_reports`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows); // Send the retrieved rows as a response
  });
});
// Quality report submission endpoint
app.post("/quality-reports", authenticateToken, upload.array("fotos"), async (req, res) => {
  console.log("Backend called")
  const { liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung } = req.body;

  const imageUrls = [];
  try {
      // Upload each image to R2
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
          const imageUrl = `${process.env.R2_PUBLIC_BUCKET_URL}/${filename}`; // Construct the image URL
          imageUrls.push(imageUrl);
      }
  } catch (error) {
      console.error('Error uploading to R2:', error);
      return res.status(500).send({ message: 'Error uploading images.' });
  }

  // Save report data to the database, including the image URLs
  db.run(`INSERT INTO quality_reports (liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, fotos) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, JSON.stringify(imageUrls)],
      function (err) {
          if (err) {
              return res.status(500).json({ message: "Database error" });
          }
          res.json({ message: "Quality report saved successfully", reportId: this.lastID });
      });
});

// Delete quality report
app.delete('/quality-reports/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM quality_reports WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Report deleted successfully" });
  });
});

// Update quality report
app.put('/quality-reports/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { liefertermin, lieferant } = req.body;
  db.run(`UPDATE quality_reports SET liefertermin = ?, lieferant = ? WHERE id = ?`,
    [liefertermin, lieferant, id],
    function(err) {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Report updated successfully" });
    }
  );
});

// POST endpoint for Auswertungen data
app.post('/auswertungen', authenticateToken, (req, res) => {
  try {
    const data = req.body; // Get data from request body
    console.log("Received data:", data); // Debugging line

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data received" });
    }

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO auswertungen 
      ("Beleg", "Firma", " Werkauftrag", "Termin", "Artikel-Nr.", " Artikel-Nr. fertig", "Beschreibung", " Beschreibung 2", 
      "urspr. Menge", "Menge offen", "Einzelpreis", "G-Preis", "Farbe", "Größe") 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    data.forEach(row => {
      try {
        stmt.run(
          row["Beleg"],
          row["Firma"],
          row[" Werkauftrag"],
          row["Termin"],
          row["Artikel-Nr."],
          row[" Artikel-Nr. fertig"],
          row["Beschreibung"],
          row[" Beschreibung 2"],
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


// GET endpoint for Auswertungen data with filtering
app.get('/auswertungen', authenticateToken, (req, res) => {
  const { beleg, firma, artikelnr, termin } = req.query;

  let whereClause = '';
  let params = [];

  if (beleg) {
      whereClause += '"Beleg" LIKE? AND ';
      params.push(`%${beleg}%`);
  }
  if (firma) {
      whereClause += '"Firma" LIKE? AND ';
      params.push(`%${firma}%`);
  } 
  if (artikelnr) {
      whereClause += '"Artikel-Nr." LIKE? AND ';
      params.push(`%${artikelnr}%`);
  }
  if (termin) {
      whereClause += '"Termin" LIKE? AND ';
      params.push(`%${termin}%`);
  }

  if (whereClause) {
      whereClause = whereClause.slice(0, -5); // Remove trailing ' AND '
      const sql = `SELECT * FROM auswertungen WHERE ${whereClause}`;
      db.all(sql, params, (err, rows) => {
          if (err) {
              return res.status(500).json({ message: "Database error" });
          }
          res.json(rows);
      });
  } else {
      // No filters provided, fetch all data
      db.all(`SELECT * FROM auswertungen`, (err, rows) => {
          if (err) {
              return res.status(500).json({ message: "Database error" });
          }
          res.json(rows);
      });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
