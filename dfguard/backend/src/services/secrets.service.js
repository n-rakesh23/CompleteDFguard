const { GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { secretsManagerClient } = require('../config/aws');

const secretsCache = {};

/**
 * Fetch a secret from AWS Secrets Manager.
 * Caches result in memory for 5 minutes.
 * Falls back to process.env in development.
 */
const getSecret = async (secretName) => {
    // In development, use env vars directly
    if (process.env.USE_SECRETS_MANAGER !== 'true') {
        const envMap = {
            'dfguard/razorpay/key_id':     process.env.RAZORPAY_KEY_ID,
            'dfguard/razorpay/key_secret':  process.env.RAZORPAY_KEY_SECRET,
            'dfguard/database/uri':         process.env.MONGODB_URI,
            'dfguard/cognito/pool_id':      process.env.COGNITO_USER_POOL_ID
        };
        return envMap[secretName] || process.env[secretName];
    }

    // Check cache
    const cached = secretsCache[secretName];
    if (cached && Date.now() - cached.timestamp < 300000) {
        return cached.value;
    }

    // Fetch from Secrets Manager
    try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const result  = await secretsManagerClient.send(command);
        const value   = result.SecretString;

        // Cache it
        secretsCache[secretName] = { value, timestamp: Date.now() };
        return value;

    } catch (error) {
        console.error(`❌ Failed to get secret ${secretName}:`, error.message);
        throw new Error(`Secret ${secretName} not found`);
    }
};

module.exports = { getSecret };
