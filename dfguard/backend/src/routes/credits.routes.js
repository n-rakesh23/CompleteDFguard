const express = require('express');
const router  = express.Router();
const { protect }     = require('../middleware/auth.middleware');
const { getCredits }  = require('../controllers/credits.controller');

// GET /api/credits — get current credit balance
router.get('/', protect, getCredits);

module.exports = router;
