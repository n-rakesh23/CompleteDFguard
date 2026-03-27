const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client }     = require('../config/aws');

const BUCKET = process.env.S3_BUCKET;

/**
 * Generate a presigned URL for direct browser → S3 upload
 * Valid for 5 minutes
 */
const getUploadPresignedUrl = async (key, contentType = 'image/jpeg') => {
    const command = new PutObjectCommand({
        Bucket:      BUCKET,
        Key:         key,
        ContentType: contentType
    });
    return getSignedUrl(s3Client, command, { expiresIn: 300 });
};

/**
 * Generate a presigned URL for downloading a protected image
 * Valid for 7 days
 */
const getDownloadPresignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key:    key
    });
    return getSignedUrl(s3Client, command, { expiresIn: 604800 });
};

/**
 * Delete an object from S3
 */
const deleteObject = async (key) => {
    const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
    return s3Client.send(command);
};

module.exports = { getUploadPresignedUrl, getDownloadPresignedUrl, deleteObject };
