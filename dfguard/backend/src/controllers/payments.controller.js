const crypto   = require('crypto');
const Razorpay = require('razorpay');
const Payment  = require('../models/Payment');
const User     = require('../models/User');
const Credit   = require('../models/Credit');
const { getSecret } = require('../services/secrets.service');

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order and returns orderId to frontend
 */
const createOrder = async (req, res, next) => {
    try {
        const keyId     = await getSecret('dfguard/razorpay/key_id');
        const keySecret = await getSecret('dfguard/razorpay/key_secret');

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const order = await razorpay.orders.create({
            amount:   149900,   // ₹1499 in paise
            currency: 'INR',
            receipt:  `rcpt_${req.user._id}_${Date.now()}`
        });

        // Save pending payment record
        await Payment.create({
            userId:          req.user._id,
            razorpayOrderId: order.id,
            amount:          149900,
            status:          'created'
        });

        res.json({
            orderId:  order.id,
            amount:   order.amount,
            currency: order.currency,
            keyId                       // Safe to expose key_id (not key_secret)
        });

    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/payments/verify
 * Cryptographically verifies the Razorpay payment signature.
 * Only upgrades the user AFTER server-side verification.
 * This is the only place where plan upgrades happen.
 */
const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment fields.' });
        }

        // 1. Verify HMAC signature — proves payment is from Razorpay
        const keySecret = await getSecret('dfguard/razorpay/key_secret');
        const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expected  = crypto
            .createHmac('sha256', keySecret)
            .update(body)
            .digest('hex');

        if (expected !== razorpay_signature) {
            console.warn(`⚠️  Invalid payment signature for user ${req.user._id}`);
            return res.status(400).json({ error: 'Payment verification failed.' });
        }

        // 2. Idempotency — prevent double-processing
        const existing = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
        if (existing && existing.status === 'verified') {
            return res.json({ success: true, message: 'Payment already processed.' });
        }

        // 3. Record the verified payment
        await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status:            'verified',
                verifiedAt:        new Date()
            },
            { upsert: true, new: true }
        );

        // 4. Upgrade user to Pro — ONLY after server-side verification
        await User.findByIdAndUpdate(req.user._id, { plan: 'pro' });

        // 5. Set credits to unlimited
        await Credit.findOneAndUpdate(
            { userId: req.user._id },
            { balance: 999999 },
            { upsert: true }
        );

        console.log(`✅ Payment verified. User ${req.user.email} upgraded to Pro.`);

        res.json({
            success: true,
            message: 'Payment verified. Pro access granted!'
        });

    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/payments/history
 * Returns user's payment history
 */
const getPaymentHistory = async (req, res, next) => {
    try {
        const payments = await Payment.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({ payments });
    } catch (err) {
        next(err);
    }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
