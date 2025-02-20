// Import necessary modules
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose(); // Import SQLite3
require('dotenv').config();

// Initialize express app
const app = express();
const db = new sqlite3.Database(':memory:'); // Use in-memory database or change to a file path

app.use(cors());
app.use(express.json()); // Parses JSON body

// Create a User table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Insert hardcoded users into the database
  const stmt = db.prepare(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`);
  stmt.run('kristijan.b', bcrypt.hashSync('password123', 10));
  stmt.run('vanessa.m', bcrypt.hashSync('password123', 10));
  stmt.finalize();
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

// Optional: Change password route
app.post('/change-password', async (req, res) => {
  const { username, newPassword } = req.body;

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password in the database
  db.run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, username], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Password updated successfully' });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
