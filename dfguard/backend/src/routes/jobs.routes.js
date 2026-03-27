const express = require('express');
const router  = express.Router();
const { protect }        = require('../middleware/auth.middleware');
const { uploadLimiter }  = require('../middleware/rateLimit');
const {
    createUploadJob,
    confirmUpload,
    getJobs,
    getJob,
    deleteJob,
    retryJob
} = require('../controllers/jobs.controller');

// POST   /api/jobs/upload      — get presigned S3 URL + create job
// POST   /api/jobs/:id/confirm — confirm S3 upload done
// POST   /api/jobs/:id/retry   — retry a failed job
// GET    /api/jobs             — list all jobs
// GET    /api/jobs/:id         — get single job
// DELETE /api/jobs/:id         — delete job

router.post('/upload',       protect, uploadLimiter, createUploadJob);
router.post('/:id/confirm',  protect,               confirmUpload);
router.post('/:id/retry',    protect,               retryJob);
router.get('/',              protect,               getJobs);
router.get('/:id',           protect,               getJob);
router.delete('/:id',        protect,               deleteJob);

module.exports = router;
