const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Protect all routes
router.use(authenticateJWT);

router.get('/history', chatbotController.getChatHistory);
router.delete('/history', chatbotController.clearChatHistory);

module.exports = router;
