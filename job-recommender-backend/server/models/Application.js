const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    jobId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'jobType'
    },
    jobType: {
        type: String,
        required: true,
        enum: ['Job', 'CreatedJob']
    },
    status: { 
        type: String, 
        enum: ['Applied', 'Viewed', 'Accepted', 'Rejected'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    viewedAt: Date,
    statusUpdatedAt: Date
}, {
    timestamps: true
});

// Ensure one application per user per job
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);