const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  }
});

// Function to initialize the database
const initializeDB = () => {
  db.exec(
    `
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;


    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quality_reports (
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
      fotos TEXT,
      dateOfInspection TEXT
    );

    CREATE TABLE IF NOT EXISTS auswertungen (
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
    );

    CREATE TABLE IF NOT EXISTS inspection (
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
    );

    CREATE TABLE IF NOT EXISTS gold_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lieferant TEXT NOT NULL CHECK(lieferant IN ('Adoma', 'Breuning', 'Sisti', 'Rösch', 'Schofer')),
      farbe TEXT NOT NULL CHECK(farbe IN ('RG', 'YG', 'WG')),
      test_month NUMBER NOT NULL,
      test_year NUMBER NOT NULL,
      bestellnr TEXT NOT NULL UNIQUE,
      bemerkung TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(lieferant, farbe, test_month)


);

  `,
    (err) => {
      if (err) {
        console.error("Error initializing database:", err.message);
        return;
      }

      // Seed default users only if no users exist
      db.get(`SELECT COUNT(*) AS count FROM users`, (err, row) => {
        if (err) {
          console.error("Database error:", err);
          return;
        }
        if (row.count === 0) {
          console.log("Seeding database with default users...");
          const hashedPassword = bcrypt.hashSync("password123", 10);
          db.exec(`
          INSERT INTO users (username, password) VALUES 
          ('kristijan.b', '${hashedPassword}'),
          ('vanessa.m', '${hashedPassword}'),
          ('michelle.s', '${hashedPassword}'),
          ('luisa.p', '${hashedPassword}'),
          ('sebastian.h', '${hashedPassword}'),
          ('sandra.h', '${hashedPassword}'),
          ('roman.j', '${hashedPassword}');
        `);
        }
      });
    }
  );
};

// Export database connection and initializer function
module.exports = { db, initializeDB };
