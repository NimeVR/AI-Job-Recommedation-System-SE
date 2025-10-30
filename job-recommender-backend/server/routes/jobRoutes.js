const express = require('express');
const router = express.Router();

// 1. Import all required controller functions
// We no longer need the auth middleware for these routes
const { createJob, getAllJobs, getRecommendedJobs } = require('../controllers/jobController');

/**
 * @route   POST api/jobs
 * @desc    Create a new job post. Now a public route.
 * @access  Public
 */
router.post('/', createJob);

/**
 * @route   GET api/jobs
 * @desc    Get a list of all jobs.
 * @access  Public
 */
router.get('/', getAllJobs);

/**
 * @route   GET api/jobs/recommendations/:username
 * @desc    Get a personalized, ranked list of jobs for a specific user.
 * @access  Public
 */
router.get('/recommendations/:username', getRecommendedJobs);

// 3. Export the router
module.exports = router;