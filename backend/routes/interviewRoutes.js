const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Protect all routes
router.use(authenticateJWT);

router.post('/start', interviewController.startInterview);
router.post('/:id/answer', interviewController.submitAnswer);
router.get('/:id', interviewController.getInterviewDetails);
router.get('/', interviewController.getUserInterviews);

module.exports = router;
