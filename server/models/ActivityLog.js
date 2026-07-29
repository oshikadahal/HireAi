const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, trim: true },
    status: { type: String, enum: ['success', 'failed', 'info'], default: 'info' },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    resource: { type: String, default: '' },
    alert: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
