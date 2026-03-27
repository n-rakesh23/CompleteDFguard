const { SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { sqsClient } = require('../config/aws');

const QUEUE_URL = process.env.SQS_QUEUE_URL;

/**
 * Send a job to the ML processing queue
 */
const sendJob = async (jobData) => {
    const command = new SendMessageCommand({
        QueueUrl:    QUEUE_URL,
        MessageBody: JSON.stringify(jobData),
        MessageAttributes: {
            jobType: {
                DataType:    'String',
                StringValue: 'image-protection'
            }
        }
    });

    const result = await sqsClient.send(command);
    console.log(`📤 Job sent to SQS: ${jobData.jobId} | MessageId: ${result.MessageId}`);
    return result;
};

/**
 * Poll queue for jobs (used by the ML worker)
 */
const receiveJobs = async (maxMessages = 1) => {
    const command = new ReceiveMessageCommand({
        QueueUrl:            QUEUE_URL,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds:     20,    // Long polling
        VisibilityTimeout:   300    // 5 min to process
    });

    const result = await sqsClient.send(command);
    return result.Messages || [];
};

/**
 * Delete a message after successful processing
 */
const deleteJob = async (receiptHandle) => {
    const command = new DeleteMessageCommand({
        QueueUrl:      QUEUE_URL,
        ReceiptHandle: receiptHandle
    });
    return sqsClient.send(command);
};

module.exports = { sendJob, receiveJobs, deleteJob };
