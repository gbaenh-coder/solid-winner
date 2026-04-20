// ═══════════════════════════════════════════
//  routes/applications.js
//  POST /api/applications      — submit application
//  GET  /api/applications/job/:jobId — get all apps for a job
//  PUT  /api/applications/:id  — update status (client side)
// ═══════════════════════════════════════════
const express     = require('express');
const Application = require('../models/Application');
const Job         = require('../models/Job');
const { protect } = require('../middleware/auth');
const { sendApplicationEmail, sendConfirmationEmail } = require('../config/email');

const router = express.Router();

// ── SUBMIT APPLICATION ──
router.post('/', async (req, res) => {
  try {
    const { jobId, applicantName, applicantEmail, applicantPhone, coverLetter, proposedRate } = req.body;

    if (!jobId || !applicantName || !applicantEmail || !coverLetter) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Get the job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ message: 'This job is no longer accepting applications' });

    // Check for duplicate application
    const duplicate = await Application.findOne({ job: jobId, 'applicant.email': applicantEmail });
    if (duplicate) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Save application
    const application = await Application.create({
      job: jobId,
      jobTitle: job.title,
      applicant: {
        name:   applicantName,
        email:  applicantEmail,
        phone:  applicantPhone,
        userId: req.user?._id
      },
      coverLetter,
      proposedRate
    });

    // Increment applications count on job
    job.applicationsCount += 1;
    await job.save();

    // Send emails (non-blocking)
    try {
      await sendApplicationEmail({
        clientEmail:   job.postedBy.email,
        clientName:    job.postedBy.name,
        jobTitle:      job.title,
        applicantName,
        applicantEmail,
        applicantPhone,
        coverLetter,
        proposedRate
      });
      await sendConfirmationEmail({ applicantEmail, applicantName, jobTitle: job.title });
    } catch (emailErr) {
      console.log('Email send error (non-fatal):', emailErr.message);
    }

    res.status(201).json({
      message: 'Application submitted successfully! The client will be in touch.',
      application
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET ALL APPLICATIONS FOR A JOB ──
router.get('/job/:jobId', protect, async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .sort({ createdAt: -1 });
    res.json({ applications, total: applications.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── UPDATE APPLICATION STATUS ──
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Status updated', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
