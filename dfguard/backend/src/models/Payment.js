const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true
    },
    razorpayPaymentId: {
        type:   String,
        unique: true,
        sparse: true   // Allow null until verified
    },
    razorpayOrderId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    amount: {
        type:     Number,
        required: true
    },
    currency: {
        type:    String,
        default: 'INR'
    },
    status: {
        type:    String,
        enum:    ['created', 'pending', 'verified', 'failed'],
        default: 'created'
    },
    verifiedAt: {
        type:    Date,
        default: null
    }
}, {
    timestamps: true
});

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
