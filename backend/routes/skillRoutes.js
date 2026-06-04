const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Protect all routes
router.use(authenticateJWT);

router.post('/', skillController.analyzeUserSkillGap);
router.get('/', skillController.getSkillAnalysisHistory);

module.exports = router;
