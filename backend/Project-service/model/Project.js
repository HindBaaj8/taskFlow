const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    owner: { type: String, required: true }, // userId from auth-service
    members: [{ type: String }],             // array of userIds
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);