const express = require('express');
const router = express.Router();
const {
    applyForJob,
    checkApplication,
    getUserApplications,
    getJobApplications,
    getApplicationCount,
    updateApplicationStatus,
    getAllEmployerApplications
} = require('../controllers/applicationController');

/**
 * @route   POST /api/applications/apply
 * @desc    Apply for a job
 * @access  Public
 */
router.post('/apply', applyForJob);

/**
 * @route   GET /api/applications/check/:username/:jobId
 * @desc    Check if user has applied for a job
 * @access  Public
 */
router.get('/check/:username/:jobId', checkApplication);

/**
 * @route   GET /api/applications/user/:username
 * @desc    Get all applications for a user
 * @access  Public
 */
router.get('/user/:username', getUserApplications);

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Get all applicants for a job
 * @access  Public
 */
router.get('/job/:jobId', getJobApplications);

/**
 * @route   GET /api/applications/count/:jobId
 * @desc    Get application count for a job
 * @access  Public
 */
router.get('/count/:jobId', getApplicationCount);

/**
 * @route   PUT /api/applications/:applicationId/status
 * @desc    Update application status
 * @access  Public
 */
router.put('/:applicationId/status', updateApplicationStatus);

/**
 * @route   GET /api/applications/employer/all
 * @desc    Get all applications for employer
 * @access  Public
 */
router.get('/employer/all', getAllEmployerApplications);

module.exports = router;