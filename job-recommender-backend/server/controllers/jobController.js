// server/controllers/jobController.js
const Job = require('../models/Job');
const CreatedJob = require('../models/CreatedJob');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Application = require('../models/Application');

// Helper function to find or create skills and return their ObjectIds
const getSkillIds = async (skillNames) => {
    if (!Array.isArray(skillNames)) {
        return [];
    }
    const skillIds = [];
    for (const name of skillNames) {
        const lowerCaseName = name.toLowerCase().trim();
        let skill = await Skill.findOne({ name: lowerCaseName });
        if (!skill) {
            skill = new Skill({ name: lowerCaseName });
            await skill.save();
            console.log(`✅ Created new skill: ${lowerCaseName}`);
        }
        skillIds.push(skill._id);
    }
    return skillIds;
};

/**
 * @desc    Create a new job posting (stored in created_jobs collection)
 * @route   POST /api/jobs
 * @access  Public
 */
exports.createJob = async (req, res) => {
    const { companyName, jobDescription, skillsRequired, Category, Workplace, Location, Department, Type } = req.body;
    
    try {
        const skillIds = await getSkillIds(skillsRequired);

        const newJob = new CreatedJob({
            companyName,
            jobDescription,
            skillsRequired: skillIds,
            Category,
            Workplace,
            Location,
            Department,
            Type,
        });

        await newJob.save();
        const populatedJob = await CreatedJob.findById(newJob._id).populate('skillsRequired', 'name');
        
        console.log(`✅ Job created in created_jobs collection: ${Category} at ${companyName}`);
        res.status(201).json(populatedJob);

    } catch (err) {
        console.error('❌ Job creation error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

/**
 * @desc    Get all jobs sorted properly
 *          Priority: Jobs with NEW applications -> All Created Jobs -> All Generated Jobs
 * @route   GET /api/jobs
 * @access  Public
 */
exports.getAllJobs = async (req, res) => {
    try {
        // Fetch from created_jobs collection
        const createdJobs = await CreatedJob.find()
            .populate('skillsRequired', 'name')
            .lean();
        
        // Fetch from jobs collection (generated data)
        const generatedJobs = await Job.find()
            .populate('skillsRequired', 'name')
            .lean();
        
        // Get application data for ALL jobs
        const allJobsWithApplicationData = await Promise.all([
            // Process Created Jobs
            ...createdJobs.map(async (job) => {
                const jobId = job._id;
                
                // Count ONLY NEW applications (status = 'Applied')
                const newApplicationCount = await Application.countDocuments({ 
                    jobId,
                    status: 'Applied' 
                });
                
                // Get the most recent NEW application date
                const latestNewApplication = await Application
                    .findOne({ jobId, status: 'Applied' })
                    .sort({ appliedAt: -1 })
                    .select('appliedAt')
                    .lean();
                
                return {
                    ...job,
                    applicationCount: newApplicationCount,
                    latestApplicationDate: latestNewApplication ? latestNewApplication.appliedAt : null,
                    hasNewApplications: newApplicationCount > 0,
                    isFromCreatedJobs: true,
                    sortPriority: newApplicationCount > 0 ? 1 : 2 // 1 = has new apps, 2 = created job without apps
                };
            }),
            // Process Generated Jobs
            ...generatedJobs.map(async (job) => {
                const jobId = job._id;
                
                const newApplicationCount = await Application.countDocuments({ 
                    jobId,
                    status: 'Applied' 
                });
                
                const latestNewApplication = await Application
                    .findOne({ jobId, status: 'Applied' })
                    .sort({ appliedAt: -1 })
                    .select('appliedAt')
                    .lean();
                
                return {
                    ...job,
                    applicationCount: newApplicationCount,
                    latestApplicationDate: latestNewApplication ? latestNewApplication.appliedAt : null,
                    hasNewApplications: newApplicationCount > 0,
                    isFromCreatedJobs: false,
                    sortPriority: newApplicationCount > 0 ? 1 : 3 // 1 = has new apps, 3 = generated job
                };
            })
        ]);
        
        // Sort by priority:
        // Priority 1: Jobs with NEW applications (any collection) - sorted by latest application
        // Priority 2: Created Jobs without applications - sorted by creation date
        // Priority 3: Generated Jobs - sorted by ID
        const sortedJobs = allJobsWithApplicationData.sort((a, b) => {
            // First sort by sortPriority
            if (a.sortPriority !== b.sortPriority) {
                return a.sortPriority - b.sortPriority;
            }
            
            // Within same priority, sort accordingly
            if (a.sortPriority === 1) {
                // Both have new applications - sort by latest application date (newest first)
                return new Date(b.latestApplicationDate) - new Date(a.latestApplicationDate);
            } else if (a.sortPriority === 2) {
                // Both are created jobs without applications - sort by creation date (newest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                // Both are generated jobs - maintain original order
                return 0;
            }
        });
        
        const jobsWithNewApps = sortedJobs.filter(j => j.hasNewApplications).length;
        const createdJobsWithoutApps = sortedJobs.filter(j => j.sortPriority === 2).length;
        const generatedJobsCount = sortedJobs.filter(j => j.sortPriority === 3).length;
        
        console.log(`📊 Returning ${sortedJobs.length} jobs in order:`);
        console.log(`   1️⃣ ${jobsWithNewApps} jobs with NEW applications (Applied status)`);
        console.log(`   2️⃣ ${createdJobsWithoutApps} created jobs without new applications`);
        console.log(`   3️⃣ ${generatedJobsCount} generated jobs`);
        
        res.json(sortedJobs);
    } catch (err) {
        console.error('❌ Get all jobs error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

/**
 * @desc    Get personalized job recommendations (created_jobs FIRST, then jobs)
 * @route   GET /api/jobs/recommendations/:username
 * @access  Public
 */
exports.getRecommendedJobs = async (req, res) => {
    try {
        const { username } = req.params;

        // Find the user
        const user = await User.findOne({ username: username }).select('skills');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        if (!user.skills || user.skills.length === 0) {
            return res.json([]);
        }
        
        const userSkillIds = user.skills;

        // Get recommendations from created_jobs (higher priority)
        const createdJobsRecommendations = await CreatedJob.aggregate([
            { $match: { skillsRequired: { $in: userSkillIds } } },
            { 
                $addFields: { 
                    matchCount: { 
                        $size: { 
                            $setIntersection: ["$skillsRequired", userSkillIds] 
                        } 
                    } 
                } 
            },
            { $sort: { matchCount: -1, createdAt: -1 } },
            { $limit: 25 }
        ]);
        
        // Get recommendations from jobs collection
        const generatedJobsRecommendations = await Job.aggregate([
            { $match: { skillsRequired: { $in: userSkillIds } } },
            { 
                $addFields: { 
                    matchCount: { 
                        $size: { 
                            $setIntersection: ["$skillsRequired", userSkillIds] 
                        } 
                    } 
                } 
            },
            { $sort: { matchCount: -1 } },
            { $limit: 25 }
        ]);
        
        // Combine: created_jobs recommendations first
        const combinedRecommendations = [
            ...createdJobsRecommendations,
            ...generatedJobsRecommendations
        ].slice(0, 50);
        
        // Populate skills for both
        const populatedJobs = await Promise.all([
            CreatedJob.populate(createdJobsRecommendations, {
                path: 'skillsRequired',
                select: 'name'
            }),
            Job.populate(generatedJobsRecommendations, {
                path: 'skillsRequired',
                select: 'name'
            })
        ]);
        
        // Merge populated results
        const allRecommendations = [
            ...populatedJobs[0],
            ...populatedJobs[1]
        ].slice(0, 50);

        console.log(`🎯 Recommendations: ${createdJobsRecommendations.length} from created_jobs + ${generatedJobsRecommendations.length} from jobs`);
        
        res.json(allRecommendations);

    } catch (err) {
        console.error('❌ Recommendations error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};