const { PublishCommand } = require('@aws-sdk/client-sns');
const { snsClient }      = require('../config/aws');

const TOPIC_ARN = process.env.SNS_TOPIC_ARN;

/**
 * Send a notification when a job completes
 */
const notifyJobComplete = async (userEmail, jobId, downloadUrl) => {
    if (!TOPIC_ARN) {
        console.warn('⚠️  SNS_TOPIC_ARN not set. Skipping notification.');
        return;
    }

    const message = {
        email:       userEmail,
        jobId,
        downloadUrl,
        message:     'Your image has been protected successfully!'
    };

    const command = new PublishCommand({
        TopicArn: TOPIC_ARN,
        Subject:  'DFGuard — Your image is protected!',
        Message:  JSON.stringify(message)
    });

    try {
        const result = await snsClient.send(command);
        console.log(`📧 SNS notification sent: ${result.MessageId}`);
    } catch (err) {
        // Non-fatal — job still succeeded even if notification fails
        console.warn('⚠️  SNS notification failed:', err.message);
    }
};

module.exports = { notifyJobComplete };
