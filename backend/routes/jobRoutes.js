const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Protect all endpoints
router.use(authenticateJWT);

router.post('/', jobController.compareJobDescription);
router.get('/', jobController.getJobAnalysisHistory);

module.exports = router;
