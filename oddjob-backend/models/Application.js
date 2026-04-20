// ═══════════════════════════════════════════
//  models/Application.js
// ═══════════════════════════════════════════
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job:    { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobTitle: { type: String },

  // Applicant info
  applicant: {
    name:   { type: String, required: true },
    email:  { type: String, required: true },
    phone:  { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  coverLetter: { type: String, required: true },
  proposedRate: { type: String },
  status: {
    type: String,
    enum: ['pending','reviewed','shortlisted','rejected','hired'],
    default: 'pending'
  },

}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
