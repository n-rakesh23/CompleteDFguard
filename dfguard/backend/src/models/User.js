const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    cognitoId: {
        type:     String,
        required: true,
        unique:   true,
        index:    true
    },
    email: {
        type:      String,
        required:  true,
        unique:    true,
        lowercase: true,
        trim:      true
    },
    fullName: {
        type:    String,
        trim:    true,
        default: ''
    },
    plan: {
        type:    String,
        enum:    ['free', 'pro'],
        default: 'free'
    },
    isAdmin: {
        type:    Boolean,
        default: false
    },
    isEmailVerified: {
        type:    Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ cognitoId: 1 });

module.exports = mongoose.model('User', UserSchema);
