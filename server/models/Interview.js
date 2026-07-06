const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    meetingLink: { type: String, default: '' },
    type: { type: String, enum: ['video', 'phone', 'in-person'], default: 'video' },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
    notes: { type: String, default: '' },
    feedback: { type: String, default: '' },
    aiQuestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
