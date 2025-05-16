// Import necessary modules
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/auth"); // Import middleware
require("dotenv").config();

//Router import
const auswertungRouter = require("./routes/auswertung");
//The next two were inside of server.js and moved to outside files
const qualityReportsRouter = require("./routes/qualityReports");
const auswertungenRouter = require("./routes/auswertungen");
const goldTestsRouter = require("./routes/goldTests");
const diamondScreeningRouter = require("./routes/diamondScreening");
const itemsRouter = require("./routes/items")
const stichprobenRouter = require("./routes/stichproben")

const { db, initializeDB } = require("./db");


initializeDB();
// Initialize express app
const app = express();

app.use(cors());
app.use(express.json({ limit: "7mb" })); // Increase the limit
app.use(express.urlencoded({ limit: "7mb", extended: true }));
app.use(express.json()); // Parses JSON body

app.use("/quality-reports", qualityReportsRouter);
app.use("/auswertungen", auswertungenRouter);
app.use("/api/auswertungen", auswertungRouter);
app.use("/gold-tests", goldTestsRouter);
app.use("/api/diamond-screening", diamondScreeningRouter);
app.use("/api/items", itemsRouter);
app.use("/api/stichproben", stichprobenRouter);

// Simple GET route to check if the server is working
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login post initiated");

  // Find user from the database
  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      if (!user)
        return res
          .status(400)
          .json({ message: "Invalid username or password" });

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Invalid username or password" });

      // Generate JWT token
      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "24h" }
      );

      // Send back token
      res.json({ message: "Login successful", token });
    }
  );
});

// Change password route (protected)
app.post("/change-password", authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const username = req.user.username; // Extract username from JWT

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in the database
  db.run(
    `UPDATE users SET password = ? WHERE username = ?`,
    [hashedPassword, username],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Password updated successfully" });
    }
  );
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
