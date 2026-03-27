const mongoose  = require('mongoose');
const Job       = require('../models/Job');
const Credit    = require('../models/Credit');
const { getUploadPresignedUrl, getDownloadPresignedUrl } = require('../services/s3.service');
const { sendJob }   = require('../services/sqs.service');

/**
 * POST /api/jobs/upload
 * 1. Check credits
 * 2. Return presigned S3 URL for direct browser upload
 * 3. Create job record
 * 4. Deduct credits
 * 5. Push to SQS
 */
const createUploadJob = async (req, res, next) => {
    try {
        const user   = req.user;
        const credit = await Credit.findOne({ userId: user._id });

        if (!credit) {
            return res.status(500).json({ error: 'Credit record not found.' });
        }

        // Reset daily credits if needed
        await credit.resetIfNeeded();

        // Server-side credit check — never trust the client
        if (user.plan !== 'pro' && credit.balance < 10) {
            return res.status(402).json({
                error:   'Insufficient credits',
                balance: credit.balance,
                message: 'Upgrade to Pro for unlimited access.'
            });
        }

        // Generate unique job ID and S3 key
        const jobId  = new mongoose.Types.ObjectId().toString();
        const s3Key  = `input/${user._id}/${jobId}.jpg`;

        // Get presigned URL — browser uploads directly to S3
        const uploadUrl = await getUploadPresignedUrl(s3Key);

        // Create job record in MongoDB
        const job = await Job.create({
            _id:        jobId,
            userId:     user._id,
            inputS3Key: s3Key,
            status:     'queued'
        });

        // Deduct credits atomically
        if (user.plan !== 'pro') {
            credit.balance -= 10;
            await credit.save();
        }

        // Send job to SQS for ML worker
        await sendJob({
            jobId:      job._id.toString(),
            userId:     user._id.toString(),
            inputS3Key: s3Key
        });

        res.status(201).json({
            jobId:     job._id,
            uploadUrl,
            credits:   user.plan === 'pro' ? null : credit.balance,
            message:   'Upload URL ready. PUT your image to uploadUrl.'
        });

    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/jobs/:id/confirm
 * Called after browser finishes uploading to S3
 */
const confirmUpload = async (req, res, next) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { status: 'processing' },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        res.json({ job, message: 'Upload confirmed. Processing started.' });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/jobs
 * Get all jobs for current user
 */
const getJobs = async (req, res, next) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            Job.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Job.countDocuments({ userId: req.user._id })
        ]);

        res.json({
            jobs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/jobs/:id
 * Get single job status + download URL
 */
const getJob = async (req, res, next) => {
    try {
        const job = await Job.findOne({
            _id:    req.params.id,
            userId: req.user._id   // Ensure ownership
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        // Refresh download URL if job is completed
        let downloadUrl = job.downloadUrl;
        if (job.status === 'completed' && job.outputS3Key && !downloadUrl) {
            downloadUrl = await getDownloadPresignedUrl(job.outputS3Key);
            job.downloadUrl = downloadUrl;
            await job.save();
        }

        res.json({ job });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/jobs/:id
 * Delete a job record. Refunds 10 credits if job was still queued.
 */
const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findOneAndDelete({
            _id:    req.params.id,
            userId: req.user._id
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }

        // Refund credits if job was queued (never processed)
        if (job.status === 'queued' && req.user.plan !== 'pro') {
            await Credit.findOneAndUpdate(
                { userId: req.user._id },
                { $inc: { balance: 10 } }
            );
        }

        res.json({ message: 'Job deleted.', refunded: job.status === 'queued' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createUploadJob,
    confirmUpload,
    getJobs,
    getJob,
    deleteJob
};
