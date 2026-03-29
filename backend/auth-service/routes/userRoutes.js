const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

// GET ALL USERS + RECHERCHE (admin)
router.get("/", verifyToken, checkRole("admin"), userController.getAllUsers);

// GET USER BY ID
router.get("/:id", verifyToken, userController.getUserById);

// UPDATE USER (admin)
router.put("/:id", verifyToken, checkRole("admin"), userController.updateUser);

// DELETE USER (admin)
router.delete("/:id", verifyToken, checkRole("admin"), userController.deleteUser);

// BLOQUER (admin)
router.patch("/:id/block", verifyToken, checkRole("admin"), userController.blockUser);

// DÉBLOQUER (admin)
router.patch("/:id/unblock", verifyToken, checkRole("admin"), userController.unblockUser);




module.exports = router;