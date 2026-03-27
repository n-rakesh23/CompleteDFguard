const { S3Client }             = require('@aws-sdk/client-s3');
const { SQSClient }            = require('@aws-sdk/client-sqs');
const { SNSClient }            = require('@aws-sdk/client-sns');
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');

const awsConfig = {
    region:      process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const s3Client             = new S3Client(awsConfig);
const sqsClient            = new SQSClient(awsConfig);
const snsClient            = new SNSClient(awsConfig);
const secretsManagerClient = new SecretsManagerClient(awsConfig);

module.exports = {
    s3Client,
    sqsClient,
    snsClient,
    secretsManagerClient
};
