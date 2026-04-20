// ═══════════════════════════════════════════
//  routes/jobs.js
//  GET    /api/jobs          — get all jobs (with filters)
//  POST   /api/jobs          — post a new job
//  GET    /api/jobs/:id      — get single job
//  PUT    /api/jobs/:id      — update job
//  DELETE /api/jobs/:id      — delete job
//  POST   /api/jobs/:id/bookmark — bookmark/unbookmark
// ═══════════════════════════════════════════
const express = require('express');
const Job     = require('../models/Job');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── GET ALL JOBS (with search & filters) ──
router.get('/', async (req, res) => {
  try {
    const { search, category, location, jobType, minBudget, maxBudget, status, page = 1, limit = 12 } = req.query;

    let query = {};

    // Search (title, description, category)
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category && category !== 'All')  query.category = category;
    if (location)  query.location  = { $regex: location, $options: 'i' };
    if (jobType)   query.jobType   = jobType;
    if (status)    query.status    = status;
    else           query.status    = 'open'; // default: only show open jobs

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs  = await Job.find(query)
      .sort({ isFeatured: -1, isUrgent: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET SINGLE JOB ──
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST A JOB ──
router.post('/', async (req, res) => {
  try {
    const { title, description, category, budget, paymentType, location, jobType, deadline, tags, posterName, posterEmail, posterPhone } = req.body;

    if (!title || !description || !category || !budget || !location) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const job = await Job.create({
      title, description, category,
      budget: Number(budget),
      paymentType, location, jobType,
      deadline: deadline ? new Date(deadline) : undefined,
      tags: tags || [],
      postedBy: {
        name:   posterName,
        email:  posterEmail,
        phone:  posterPhone,
        userId: req.user?._id   // optional — works even if not logged in
      }
    });

    res.status(201).json({ message: 'Job posted successfully!', job });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── BOOKMARK / UNBOOKMARK ──
// POST /api/jobs/:id/bookmark  (requires login)
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.id;

    const isSaved = user.bookmarks.includes(jobId);

    if (isSaved) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== jobId);
      await user.save();
      return res.json({ message: 'Job removed from bookmarks', saved: false });
    } else {
      user.bookmarks.push(jobId);
      await user.save();
      return res.json({ message: 'Job bookmarked!', saved: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET MY BOOKMARKS ──
router.get('/user/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
