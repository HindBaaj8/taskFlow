const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const logger = require("./middlewares/logger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(process.env.PORT || 3001, () => {
      console.log(`Auth Service démarré sur le port ${process.env.PORT || 3001}`);
    });
  })
  .catch((err) => console.error("Erreur MongoDB :", err));