const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'hired', 'rejected'],
      default: 'applied',
    },
    matchScore: { type: Number, default: 0, min: 0, max: 100 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    coverLetter: { type: String, default: '', maxlength: 3000 },
    notes: { type: String, default: '' },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
