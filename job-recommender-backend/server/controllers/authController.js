const User = require('../models/User');
const Skill = require('../models/Skill');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to find or create skills and return their IDs
const getSkillIds = async (skillNames) => {
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

// Add this export at the end
exports.getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        
        const user = await User.findOne({ username })
            .select('-password')
            .populate('skills', 'name');
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('❌ Get profile error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.register = async (req, res) => {
    const { username, password, role, name, degree, skills } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role,
        });

        if (role === 'jobseeker') {
            if (!name || !degree || !skills) {
                return res.status(400).json({ msg: 'Please provide name, degree, and skills for job seeker' });
            }
            newUser.name = name;
            newUser.degree = degree;
            newUser.skills = await getSkillIds(skills);
        }

        await newUser.save();
        res.status(201).json({ msg: 'User registered successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};