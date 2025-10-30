const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    skillsRequired: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Job', JobSchema);