// ═══════════════════════════════════════════
//  models/Job.js
// ═══════════════════════════════════════════
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    {
    type: String, required: true,
    enum: ['Tech & Dev','Design','Writing','Photography','Repairs',
           'Catering','Events','Delivery','Cleaning','Finance','Fashion','Marketing','Other']
  },
  budget:      { type: Number, required: true },
  paymentType: { type: String, enum: ['Fixed Price','Per Hour','Per Month','Negotiable'], default: 'Fixed Price' },
  location:    { type: String, required: true },
  jobType:     { type: String, enum: ['One-off','Contract','Part-time','Full-time','Ongoing'], default: 'One-off' },
  deadline:    { type: Date },
  tags:        [{ type: String }],
  status:      { type: String, enum: ['open','in-progress','closed'], default: 'open' },
  isFeatured:  { type: Boolean, default: false },
  isUrgent:    { type: Boolean, default: false },

  // Who posted it
  postedBy: {
    name:  { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // Applications count
  applicationsCount: { type: Number, default: 0 },
  views:             { type: Number, default: 0 },

}, { timestamps: true });

// Text search index
jobSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Job', jobSchema);
