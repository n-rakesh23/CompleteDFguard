const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { getSigningKey, COGNITO_ISSUER } = require('../config/cognito');

/**
 * Verifies the Cognito JWT from Authorization header.
 * Creates the user in MongoDB on first login automatically.
 */
const protect = async (req, res, next) => {
    try {
        // 1. Extract token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }
        const token = authHeader.split(' ')[1];

        // 2. Verify signature against Cognito public keys
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(
                token,
                getSigningKey,
                {
                    algorithms: ['RS256'],
                    issuer:     COGNITO_ISSUER
                },
                (err, payload) => {
                    if (err) reject(err);
                    else     resolve(payload);
                }
            );
        });

        // 3. Ensure token_use is id (not access)
        if (decoded.token_use !== 'id') {
            return res.status(401).json({ error: 'Invalid token type. Use ID token.' });
        }

        // 4. Find or create user in MongoDB
        let user = await User.findOne({ cognitoId: decoded.sub });

        if (!user) {
            // First login — auto-create user profile
            user = await User.create({
                cognitoId:       decoded.sub,
                email:           decoded.email,
                fullName:        decoded.name || decoded.email.split('@')[0],
                isEmailVerified: decoded.email_verified || false
            });

            // Initialize credits for new user
            const Credit = require('../models/Credit');
            await Credit.create({ userId: user._id });

            console.log(`✅ New user created: ${user.email}`);
        }

        // 5. Update last login
        user.lastLoginAt = new Date();
        await user.save();

        req.user    = user;
        req.decoded = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Authentication failed.' });
    }
};

module.exports = { protect };
