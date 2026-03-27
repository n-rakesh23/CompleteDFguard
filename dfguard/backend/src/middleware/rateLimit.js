const rateLimit = require('express-rate-limit');
const { getRedis } = require('../config/redis');

/**
 * General API rate limiter — 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      100,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: 'Too many requests. Please try again in 15 minutes.' }
});

/**
 * Auth rate limiter — stricter, 10 attempts per 15 minutes
 * Prevents brute force on login/signup
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      10,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: 'Too many auth attempts. Please wait 15 minutes.' },
    skipSuccessfulRequests: true  // Only count failed attempts
});

/**
 * Upload rate limiter — 20 uploads per hour
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max:      20,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: 'Upload limit reached. Try again in an hour.' }
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };
