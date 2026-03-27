const jwksClient = require('jwks-rsa');

const COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

const cognitoJwksClient = jwksClient({
    jwksUri:             `${COGNITO_ISSUER}/.well-known/jwks.json`,
    cache:               true,
    cacheMaxEntries:     5,
    cacheMaxAge:         600000, // 10 minutes
    rateLimit:           true,
    jwksRequestsPerMinute: 10
});

const getSigningKey = (header, callback) => {
    cognitoJwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
};

module.exports = {
    cognitoJwksClient,
    getSigningKey,
    COGNITO_ISSUER
};
