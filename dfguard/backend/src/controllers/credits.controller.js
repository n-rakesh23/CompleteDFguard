const Credit = require('../models/Credit');

/**
 * GET /api/credits
 * Get current credit balance
 */
const getCredits = async (req, res, next) => {
    try {
        let credit = await Credit.findOne({ userId: req.user._id });

        if (!credit) {
            // Auto-create if missing
            credit = await Credit.create({ userId: req.user._id });
        }

        // Reset if 24 hours have passed
        await credit.resetIfNeeded();

        res.json({
            balance:   req.user.plan === 'pro' ? null : credit.balance,
            isPro:     req.user.plan === 'pro',
            lastReset: credit.lastReset,
            nextReset: req.user.plan === 'free'
                ? new Date(new Date(credit.lastReset).getTime() + 86400000)
                : null
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getCredits };
