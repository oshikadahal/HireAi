const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    // Optional: companies registered by HR always have a user. Companies created
    // directly by an admin (a "house" listing, with no HR account) leave this empty.
    // sparse:true lets multiple documents have no `user` without violating uniqueness.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, unique: true, sparse: true },
    companyName: { type: String, required: [true, 'Company name is required'], trim: true },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 2000 },
    industry: { type: String, default: '' },
    size: { type: String, enum: ['', '1-10', '11-50', '51-200', '201-500', '500+'], default: '' },
    location: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    createdByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
