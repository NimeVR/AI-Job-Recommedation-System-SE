// server/controllers/applicationController.js
const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const CreatedJob = require('../models/CreatedJob');

exports.applyForJob = async (req, res) => {
    try {
        const { username, jobId, jobType } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const existingApplication = await Application.findOne({
            userId: user._id,
            jobId: jobId
        });

        if (existingApplication) {
            return res.status(400).json({ 
                msg: 'You have already applied for this job',
                alreadyApplied: true 
            });
        }

        const application = new Application({
            userId: user._id,
            jobId: jobId,
            jobType: jobType || 'Job',
            status: 'Applied'
        });

        await application.save();
        
        console.log(`✅ Application created: User ${username} applied for job ${jobId}`);
        res.status(201).json({ 
            msg: 'Application submitted successfully',
            application 
        });

    } catch (err) {
        console.error('❌ Apply error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.checkApplication = async (req, res) => {
    try {
        const { username, jobId } = req.params;

        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ hasApplied: false });
        }

        const application = await Application.findOne({
            userId: user._id,
            jobId: jobId
        });

        res.json({ 
            hasApplied: !!application,
            status: application ? application.status : null,
            application: application
        });

    } catch (err) {
        console.error('❌ Check application error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getUserApplications = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const applications = await Application.find({ userId: user._id })
            .sort({ appliedAt: -1 });

        const populatedApplications = await Promise.all(
            applications.map(async (app) => {
                let job;
                if (app.jobType === 'CreatedJob') {
                    job = await CreatedJob.findById(app.jobId).populate('skillsRequired', 'name');
                } else {
                    job = await Job.findById(app.jobId).populate('skillsRequired', 'name');
                }
                
                return {
                    ...app.toObject(),
                    job: job
                };
            })
        );

        console.log(`📊 Fetched ${applications.length} applications for user ${username}`);
        res.json(populatedApplications);

    } catch (err) {
        console.error('❌ Get user applications error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;

        const applications = await Application.find({ jobId })
            .populate('userId', 'name username degree skills')
            .sort({ appliedAt: -1 });

        const populatedApplications = await User.populate(applications, {
            path: 'userId.skills',
            select: 'name'
        });

        console.log(`📊 Fetched ${applications.length} applications for job ${jobId}`);
        res.json(populatedApplications);

    } catch (err) {
        console.error('❌ Get job applications error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

/**
 * CRITICAL: Only count applications with status 'Applied' (NEW applications)
 * When status changes to Viewed/Accepted/Rejected, they are no longer counted
 */
exports.getApplicationCount = async (req, res) => {
    try {
        const { jobId } = req.params;
        
        // ONLY count applications with status 'Applied'
        const count = await Application.countDocuments({ 
            jobId,
            status: 'Applied' 
        });
        
        console.log(`📊 Job ${jobId} has ${count} NEW applications (Applied status)`);
        res.json({ count });
    } catch (err) {
        console.error('❌ Get count error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!['Viewed', 'Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const oldStatus = application.status;
        application.status = status;
        application.statusUpdatedAt = Date.now();
        
        if (status === 'Viewed' && !application.viewedAt) {
            application.viewedAt = Date.now();
        }

        await application.save();

        console.log(`✅ Application ${applicationId} status updated: ${oldStatus} → ${status}`);
        console.log(`   This will ${oldStatus === 'Applied' ? 'DECREASE' : 'not affect'} the notification count`);
        
        res.json({ 
            msg: 'Status updated successfully',
            application 
        });

    } catch (err) {
        console.error('❌ Update status error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.getAllEmployerApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('userId', 'name username degree skills')
            .sort({ appliedAt: -1 });

        const populatedApplications = await Promise.all(
            applications.map(async (app) => {
                let job;
                if (app.jobType === 'CreatedJob') {
                    job = await CreatedJob.findById(app.jobId).populate('skillsRequired', 'name');
                } else {
                    job = await Job.findById(app.jobId).populate('skillsRequired', 'name');
                }
                
                return {
                    ...app.toObject(),
                    job: job
                };
            })
        );

        const finalPopulated = await User.populate(populatedApplications, {
            path: 'userId.skills',
            select: 'name'
        });

        res.json(finalPopulated);

    } catch (err) {
        console.error('❌ Get all employer applications error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};