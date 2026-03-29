const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const taskController = require("../controllers/taskControllers");

// All routes protected
router.use(protect);

// CREATE
router.post("/", taskController.createTask);

// GET ALL (with filters)
router.get("/", taskController.getTasks);

// GET KANBAN by project
router.get("/kanban/:projectId", taskController.getKanban);

// GET SINGLE
router.get("/:id", taskController.getTaskById);

// UPDATE
router.put("/:id", taskController.updateTask);

// CHANGE STATUS
router.patch("/:id/status", taskController.changeStatus);

// DELETE
router.delete("/:id", taskController.deleteTask);

module.exports = router;
