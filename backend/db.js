const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  }
});

// Convert Excel serial date to DD.MM.YYYY
function convertExcelSerialToDate(serial) {
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const converted = new Date(epoch.getTime() + serial * 86400 * 1000);
  return `${converted.getDate().toString().padStart(2, "0")}.${(
    converted.getMonth() + 1
  ).toString().padStart(2, "0")}.${converted.getFullYear()}`;
}

// Fix Excel-style 'Termin' values in auswertungen
function fixExistingTerminDates() {
  db.all(`SELECT id, "Termin" FROM auswertungen`, (err, rows) => {
    if (err) {
      console.error("Failed to read Termin fields:", err);
      return;
    }

    const updates = rows
      .filter((row) => /^\d+$/.test(row["Termin"]))
      .map((row) => ({
        id: row.id,
        fixedDate: convertExcelSerialToDate(Number(row["Termin"])),
      }));

    if (updates.length === 0) {
      console.log("✅ No Excel-style 'Termin' dates to fix.");
      return;
    }

    db.serialize(() => {
      const stmt = db.prepare(`UPDATE auswertungen SET "Termin" = ? WHERE id = ?`);
      updates.forEach(({ fixedDate, id }) => {
        stmt.run(fixedDate, id);
      });
      stmt.finalize(() => {
        console.log(`✅ Fixed ${updates.length} old Excel-style 'Termin' dates.`);
      });
    });
  });
}

// Initialize the database and tables
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
      "Werkauftrag" TEXT,
      "Termin" TEXT,
      "Artikel-Nr." TEXT,
      "Artikel-Nr. fertig" TEXT,
      "Beschreibung" TEXT,
      "Beschreibung 2" TEXT,
      "urspr. Menge" INTEGER,
      "Menge offen" INTEGER,
      "Einzelpreis" REAL,
      "G-Preis" REAL,
      "Farbe" TEXT,
      "Größe" TEXT,
      UNIQUE("Beleg", "Artikel-Nr. fertig") 
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

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Artikelgruppe TEXT,
      Artikelnummer TEXT UNIQUE,
      Bestand INTEGER,
      Bezeichnung TEXT,
      Inaktiv BOOLEAN,
      LetzterEK REAL,
      Lieferantenname TEXT,
      Lieferfrist INTEGER,
      MakeOrBuy TEXT,
      Matchcode TEXT,
      Mengeneinheit TEXT,
      "UVP - Euro " REAL,
      "VK 1 - Euro" REAL,
      "verfügbar in" INTEGER,
      _ARTIKELGRUPPENEU TEXT,
      _BESTSELLER BOOLEAN,
      _MARKETINGFOCUS BOOLEAN,
      _PARETOCLUSTER TEXT,
      _REGULARREPLENISHMENT BOOLEAN,
      _SILHOUETTE TEXT
    );

    CREATE TABLE IF NOT EXISTS diamond_screenings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      liefertermin TEXT NOT NULL,
      lieferant TEXT NOT NULL,
      bestellnr TEXT NOT NULL,
      artikelnr TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      bemerkung TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(bestellnr, artikelnr, liefertermin)
    );


    -- NEW TABLE for Stichprobenform results
    CREATE TABLE IF NOT EXISTS stichproben (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artikelnr TEXT NOT NULL,
      firma TEXT NOT NULL,
      orderNumber TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('approved', 'rejected', 'needs_review')),
      mitarbeiter TEXT,
      allgemein_checks TEXT,
      allgemein_remarks TEXT,
      oberflaeche_checks TEXT,
      oberflaeche_remarks TEXT,
      masse_checks TEXT,
      masse_remarks TEXT,
      mechanik_checks TEXT,
      mechanik_remarks TEXT,
      steine_checks TEXT,
      steine_remarks TEXT,
      weiter_checks TEXT,
      weiter_remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
    (err) => {
      if (err) {
        console.error("Error initializing database:", err.message);
        return;
      }

      // Seed users
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

module.exports = { db, initializeDB };
