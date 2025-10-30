const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['jobseeker', 'jobposter'], required: true },
    // Fields specific to job seekers
    name: { type: String },
    degree: { type: String },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }]
});

module.exports = mongoose.model('User', UserSchema);