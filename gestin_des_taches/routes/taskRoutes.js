const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");

// CREATE
router.post("/", authMiddleware, taskController.createTask);

// GET ALL (مع filter)
router.get("/", authMiddleware, taskController.getTasks);

// UPDATE
router.put("/:id", authMiddleware, taskController.updateTask);

// DELETE
router.delete("/:id", authMiddleware, taskController.deleteTask);

// CHANGE STATUS
router.patch("/:id/status", authMiddleware, taskController.changeStatus);

module.exports = router;