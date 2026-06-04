const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

// All endpoints protected by JWT auth
router.use(authenticateJWT);

router.post('/', uploadResume, resumeController.uploadAndAnalyzeResume);
router.get('/', resumeController.getUserResumes);
router.get('/latest', resumeController.getLatestResume);

module.exports = router;
