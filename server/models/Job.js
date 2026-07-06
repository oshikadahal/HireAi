const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    description: { type: String, required: [true, 'Job description is required'] },
    skillsRequired: { type: [String], default: [], validate: (v) => v.length > 0 },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    experience: { type: String, default: '' },
    location: { type: String, default: '' },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
      default: 'full-time',
    },
    category: { type: String, default: 'Other' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    deadline: { type: Date },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });

module.exports = mongoose.model('Job', jobSchema);
