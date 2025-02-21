// Import necessary modules
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require("./middleware/auth"); // Import middleware
const multer = require("multer");
const path = require("path");

const sqlite3 = require('sqlite3').verbose(); // Import SQLite3
require('dotenv').config();

// Initialize express app
const app = express();
const db = new sqlite3.Database('./database.sqlite'); // Saves to a file
// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/"); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage });

app.use(cors());
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

app.post("/quality-reports", authenticateToken, upload.array("fotos"), (req, res) => {
  console.log("Backend called")
  const { liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung } = req.body;

  // Extract the file paths from req.files
  const fotoPaths = req.files.map(file => file.path);
  console.log("ich bins",{liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung})

  // Save report data to the database, including the file paths
  db.run(`INSERT INTO quality_reports (liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, fotos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [liefertermin, lieferant, auftragsnummer, artikelnr, produkt, mangel, mangelgrad, mangelgrund, mitarbeiter, lieferantInformiertAm, loesung, JSON.stringify(fotoPaths)], 
      function(err) {
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
