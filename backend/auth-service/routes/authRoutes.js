const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// INSCRIPTION
router.post("/register", authController.register);

// CONNEXION
router.post("/login", authController.login);

module.exports = router;