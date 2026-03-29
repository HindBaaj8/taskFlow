const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, index: true },
    sender: { type: String, required: true },        // userId
    senderName: { type: String, required: true },    // display name
    content: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'notification'],
      default: 'text',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);