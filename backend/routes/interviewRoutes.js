const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const { checkInterviewLimit } = require('../middleware/proMiddleware');

// Protect all routes
router.use(authenticateJWT);

router.post('/start', checkInterviewLimit, interviewController.startInterview);
router.post('/:id/answer', interviewController.submitAnswer);
router.get('/:id', interviewController.getInterviewDetails);
router.get('/', interviewController.getUserInterviews);

module.exports = router;
