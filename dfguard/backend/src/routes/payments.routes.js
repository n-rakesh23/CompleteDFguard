const express = require('express');
const router  = express.Router();
const { protect }       = require('../middleware/auth.middleware');
const { authLimiter }   = require('../middleware/rateLimit');
const {
    createOrder,
    verifyPayment,
    getPaymentHistory
} = require('../controllers/payments.controller');

// POST /api/payments/create-order — create Razorpay order
// POST /api/payments/verify       — verify payment server-side
// GET  /api/payments/history      — get payment history

router.post('/create-order', protect, authLimiter, createOrder);
router.post('/verify',       protect,              verifyPayment);
router.get('/history',       protect,              getPaymentHistory);

module.exports = router;
