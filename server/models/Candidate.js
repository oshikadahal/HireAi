const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    field: { type: String, trim: true },
    startYear: Number,
    endYear: Number,
    current: { type: Boolean, default: false },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    description: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
  },
  { _id: true }
);

const candidateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, default: '', maxlength: 150 },
    bio: { type: String, default: '', maxlength: 1000 },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    resumeUrl: { type: String, default: '' },
    resumeText: { type: String, default: '', select: false },
    parsedSkills: { type: [String], default: [] },
    lastParsedAt: { type: Date },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
