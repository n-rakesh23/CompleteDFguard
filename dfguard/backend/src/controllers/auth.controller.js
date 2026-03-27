const User   = require('../models/User');
const Credit = require('../models/Credit');

/**
 * GET /api/auth/me
 * Returns current user profile + credit info
 */
const getMe = async (req, res, next) => {
    try {
        const user   = req.user;
        const credit = await Credit.findOne({ userId: user._id });

        // Reset daily credits if needed before returning
        if (credit) await credit.resetIfNeeded();

        res.json({
            user: {
                id:              user._id,
                email:           user.email,
                fullName:        user.fullName,
                plan:            user.plan,
                isEmailVerified: user.isEmailVerified,
                createdAt:       user.createdAt
            },
            credits: {
                balance:   user.plan === 'pro' ? null : credit?.balance ?? 0,
                isPro:     user.plan === 'pro',
                lastReset: credit?.lastReset
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/auth/profile
 * Update user's display name
 */
const updateProfile = async (req, res, next) => {
    try {
        const { fullName } = req.body;

        if (!fullName || fullName.trim().length < 2) {
            return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { fullName: fullName.trim() },
            { new: true }
        );

        res.json({ message: 'Profile updated', user: { fullName: user.fullName } });
    } catch (err) {
        next(err);
    }
};

module.exports = { getMe, updateProfile };
