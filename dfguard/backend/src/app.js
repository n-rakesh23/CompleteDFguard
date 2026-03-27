require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const { connectDB }    = require('./config/db');
const { connectRedis } = require('./config/redis');
const errorHandler     = require('./middleware/errorHandler');

// Route imports
const authRoutes    = require('./routes/auth.routes');
const jobRoutes     = require('./routes/jobs.routes');
const creditRoutes  = require('./routes/credits.routes');
const paymentRoutes = require('./routes/payments.routes');

const app = express();

// ─────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin:      process.env.FRONTEND_URL || '*',
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─────────────────────────────────────────
// GENERAL MIDDLEWARE
// ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// ─────────────────────────────────────────
// HEALTH CHECK (before auth middleware)
// ─────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        status:    'healthy',
        timestamp: new Date().toISOString(),
        env:       process.env.NODE_ENV
    });
});

// ─────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/jobs',     jobRoutes);
app.use('/api/credits',  creditRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ─────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
const start = async () => {
    try {
        await connectDB();
        await connectRedis();

        const PORT = process.env.PORT || 8000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 DFGuard API running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

start();

module.exports = app;
