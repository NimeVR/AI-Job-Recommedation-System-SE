const Job = require('../models/Job');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Helper function to find or create skills and return their ObjectIds
const getSkillIds = async (skillNames) => {
    if (!Array.isArray(skillNames)) {
        return [];
    }
    const skillIds = [];
    for (const name of skillNames) {
        const lowerCaseName = name.toLowerCase();
        let skill = await Skill.findOne({ name: lowerCaseName });
        if (!skill) {
            skill = new Skill({ name: lowerCaseName });
            await skill.save();
        }
        skillIds.push(skill._id);
    }
    return skillIds;
};

/**
 * @desc    Create a new job posting (now a public endpoint)
 * @route   POST /api/jobs
 * @access  Public
 */
exports.createJob = async (req, res) => {
    const { companyName, jobDescription, skillsRequired, Category, Workplace, Location, Department, Type } = req.body;
    
    try {
        const skillIds = await getSkillIds(skillsRequired);

        const newJob = new Job({
            companyName,
            jobDescription,
            skillsRequired: skillIds,
            Category,
            Workplace,
            Location,
            Department,
            Type,
            // The 'postedBy' field is removed as we no longer have an authenticated user
        });

        await newJob.save();
        const populatedJob = await Job.findById(newJob._id).populate('skillsRequired', 'name');
        res.status(201).json(populatedJob);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get all jobs (for general browsing)
 * @route   GET /api/jobs
 * @access  Public
 */
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('skillsRequired', 'name');
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get personalized job recommendations for a specific user by their username
 * @route   GET /api/jobs/recommendations/:username
 * @access  Public
 */
exports.getRecommendedJobs = async (req, res) => {
    try {
        // 1. Get the username from the URL parameters instead of a token
        const { username } = req.params;

        // 2. Find the user in the database by their username
        const user = await User.findOne({ username: username }).select('skills');
        
        // Handle cases where the user does not exist or has no skills
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        if (!user.skills || user.skills.length === 0) {
            return res.json([]); // Return an empty array if the user has no skills
        }
        
        const userSkillIds = user.skills;

        // 3. The rest of the aggregation logic remains the same
        const recommendedJobs = await Job.aggregate([
            { $match: { skillsRequired: { $in: userSkillIds } } },
            { $addFields: { matchCount: { $size: { $setIntersection: ["$skillsRequired", userSkillIds] } } } },
            { $sort: { matchCount: -1, companyName: 1 } },
            { $limit: 50 }
        ]);
        
        const populatedJobs = await Job.populate(recommendedJobs, {
            path: 'skillsRequired',
            select: 'name'
        });

        res.json(populatedJobs);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};