const express = require("express");
const router = express.Router();

const commentController = require("../controllers/commentController");

// ADD COMMENT
router.post("/",commentController.addComment);

// GET COMMENTS BY TASK
router.get("/task/:taskId",commentController.getCommentsByTask);

module.exports = router;