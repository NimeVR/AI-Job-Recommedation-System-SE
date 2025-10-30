const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, lowercase: true }
});

module.exports = mongoose.model('Skill', SkillSchema);