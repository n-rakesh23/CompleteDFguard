const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    userId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true,
        index:    true
    },
    status: {
        type:    String,
        enum:    ['queued', 'processing', 'completed', 'failed'],
        default: 'queued',
        index:   true
    },
    inputS3Key:     { type: String, required: true },
    outputS3Key:    { type: String, default: null },
    downloadUrl:    { type: String, default: null },
    creditsCharged: { type: Number, default: 10 },
    errorMessage:   { type: String, default: null },
    completedAt:    { type: Date,   default: null },

    // Thumbnail for gallery display
    thumbnailUrl: { type: String, default: null }
}, {
    timestamps: true
});

JobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);
