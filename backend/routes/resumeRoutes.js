const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

const { checkResumeLimit } = require('../middleware/proMiddleware');

// All endpoints protected by JWT auth
router.use(authenticateJWT);

router.post('/', uploadResume, checkResumeLimit, resumeController.uploadAndAnalyzeResume);
router.get('/', resumeController.getUserResumes);
router.get('/latest', resumeController.getLatestResume);
router.delete('/', resumeController.clearResumeHistory);

module.exports = router;
