const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
    pointsEarned: { type: Number, default: 0 },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeTakenMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resultSchema.index({ assessment: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentResult', resultSchema);
