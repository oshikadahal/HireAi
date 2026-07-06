const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['mcq', 'coding', 'aptitude'], default: 'mcq' },
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: '' },
    points: { type: Number, default: 10, min: 1, max: 100 },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: { type: [questionSchema], default: [] },
    duration: { type: Number, required: true, min: 5, max: 240 },
    totalPoints: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
