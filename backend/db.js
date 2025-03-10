const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.sqlite'); // Define db connection once

// Function to initialize the database
const initializeDB = () => {
  db.serialize(() => {
    // Create Users table
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
        stmt.run('michelle.s', bcrypt.hashSync('password123', 10));
        stmt.run('luisa.p', bcrypt.hashSync('password123', 10));
        stmt.run('sebastian.h', bcrypt.hashSync('password123', 10));
        stmt.run('sandra.h', bcrypt.hashSync('password123', 10));
        stmt.run('roman.j', bcrypt.hashSync('password123', 10));



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
    )`);

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
      UNIQUE("Beleg", " Artikel-Nr. fertig") 
    )`);

    // Create Inspection table
    db.run(`CREATE TABLE IF NOT EXISTS inspection (
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
    )`);
  });
};

// Export database connection and initializer function
module.exports = { db, initializeDB };
