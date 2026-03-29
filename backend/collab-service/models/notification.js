const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: String, required: true, index: true }, // userId
    type: {
      type: String,
      enum: ['new_task', 'task_assigned', 'new_message', 'task_done', 'project_update'],
      required: true,
    },
    message: { type: String, required: true },
    projectId: { type: String },
    taskId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);