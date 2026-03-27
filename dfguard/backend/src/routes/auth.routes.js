const express    = require('express');
const router     = express.Router();
const { protect }           = require('../middleware/auth.middleware');
const { authLimiter }       = require('../middleware/rateLimit');
const { getMe, updateProfile } = require('../controllers/auth.controller');

// GET  /api/auth/me        — get current user
// PUT  /api/auth/profile   — update display name

router.get('/me',      protect,              getMe);
router.put('/profile', protect,              updateProfile);

module.exports = router;
