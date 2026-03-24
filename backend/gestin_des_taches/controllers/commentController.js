const Task = require("../models/task");
const Comment = require("../models/comment");

exports.addComment = async (req, res) => {
  try {
    const { content, taskId } = req.body;

    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = new Comment({
      content,
      task: taskId,
      user: req.user.id
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};