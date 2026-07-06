const asyncHandler = require('express-async-handler');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');

// POST /api/assessments  (HR)
exports.createAssessment = asyncHandler(async (req, res) => {
  const { title, description, jobId, questions, duration } = req.body;

  if (!title || !Array.isArray(questions) || questions.length === 0 || !duration) {
    res.status(400);
    throw new Error('Title, at least one question, and a duration are required');
  }

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0);

  const assessment = await Assessment.create({
    title,
    description,
    job: jobId || undefined,
    questions,
    duration,
    totalPoints,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, assessment });
});

// GET /api/assessments/my-created  (HR)
exports.getMyAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ createdBy: req.user._id })
    .populate('job', 'title')
    .sort({ createdAt: -1 });
  res.json({ success: true, assessments });
});

// GET /api/assessments/job/:jobId  (candidate - questions without correct answers)
exports.getAssessmentsByJob = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ job: req.params.jobId, isActive: true }).select(
    '-questions.correctAnswer'
  );
  res.json({ success: true, assessments });
});

// GET /api/assessments/:id/take  (candidate - single assessment, no answers leaked)
exports.getAssessmentToTake = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id).select('-questions.correctAnswer');
  if (!assessment || !assessment.isActive) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  const already = await AssessmentResult.findOne({ assessment: assessment._id, candidate: req.user._id });
  if (already) {
    res.status(400);
    throw new Error('You have already completed this assessment');
  }

  res.json({ success: true, assessment });
});

// POST /api/assessments/:id/submit  (candidate)
exports.submitAssessment = asyncHandler(async (req, res) => {
  const { answers = [], timeTakenMinutes = 0 } = req.body;

  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found');
  }

  const existing = await AssessmentResult.findOne({ assessment: assessment._id, candidate: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already submitted this assessment');
  }

  let score = 0;
  const graded = answers.map((ans) => {
    const question = assessment.questions.id(ans.questionId);
    if (!question) return { questionId: ans.questionId, answer: ans.answer || '', isCorrect: false, pointsEarned: 0 };

    const isCorrect =
      question.type === 'mcq'
        ? String(question.correctAnswer).trim().toLowerCase() === String(ans.answer || '').trim().toLowerCase()
        : false; // coding/aptitude free-text answers are reviewed manually by HR, not auto-graded

    const pointsEarned = isCorrect ? question.points : 0;
    score += pointsEarned;
    return { questionId: ans.questionId, answer: ans.answer || '', isCorrect, pointsEarned };
  });

  const percentage = assessment.totalPoints > 0 ? Math.round((score / assessment.totalPoints) * 100) : 0;

  const result = await AssessmentResult.create({
    assessment: assessment._id,
    candidate: req.user._id,
    answers: graded,
    score,
    totalPoints: assessment.totalPoints,
    percentage,
    timeTakenMinutes,
  });

  res.status(201).json({ success: true, result });
});

// GET /api/assessments/my-results  (candidate)
exports.getMyResults = asyncHandler(async (req, res) => {
  const results = await AssessmentResult.find({ candidate: req.user._id })
    .populate('assessment', 'title duration totalPoints')
    .sort({ createdAt: -1 });
  res.json({ success: true, results });
});

// GET /api/assessments/:id/results  (HR - see all candidate results for one assessment)
exports.getAssessmentResults = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found or not authorized');
  }
  const results = await AssessmentResult.find({ assessment: assessment._id })
    .populate('candidate', 'name email avatar')
    .sort({ percentage: -1 });
  res.json({ success: true, assessment, results });
});
