const mongoose = require('mongoose');

const CreditSchema = new mongoose.Schema({
    userId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true,
        unique:   true
    },
    balance: {
        type:    Number,
        default: 30,
        min:     0
    },
    lastReset: {
        type:    Date,
        default: Date.now
    }
}, {
    timestamps: true
});

/**
 * Reset credits to 30 if 24 hours have passed (free plan only)
 * Called before every credit check
 */
CreditSchema.methods.resetIfNeeded = async function () {
    const User         = mongoose.model('User');
    const user         = await User.findById(this.userId);
    const hoursSince   = (Date.now() - new Date(this.lastReset)) / 3600000;

    if (user?.plan === 'free' && hoursSince >= 24) {
        this.balance   = 30;
        this.lastReset = new Date();
        await this.save();
        console.log(`🔄 Credits reset for user ${this.userId}`);
    }
};

module.exports = mongoose.model('Credit', CreditSchema);
