const express = require("express");
const router = express.Router();

const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/auth");

// ADD COMMENT
router.post("/", authMiddleware, commentController.addComment);

// GET COMMENTS BY TASK
router.get("/task/:taskId", authMiddleware, commentController.getCommentsByTask);

module.exports = router;