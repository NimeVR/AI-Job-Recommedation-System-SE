const mongoose = require('mongoose');

const CreatedJobSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    Category: { type: String, required: true },
    skillsRequired: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    Type: { type: String, required: true },
    Workplace: { type: String, required: true },
    Location: { type: String, required: true },
    Department: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'created_jobs' // Explicitly set collection name
});

module.exports = mongoose.model('CreatedJob', CreatedJobSchema);