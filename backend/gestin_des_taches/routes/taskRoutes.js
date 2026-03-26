const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskControllers");

// CREATE
router.post("/",taskController.createTask);

// GET ALL 
router.get("/",taskController.getTasks);

// UPDATE
router.put("/:id",taskController.updateTask);

// DELETE
router.delete("/:id",taskController.deleteTask);

// CHANGE STATUS
router.patch("/:id/status",taskController.changeStatus);

module.exports = router;