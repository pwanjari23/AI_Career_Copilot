const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const { checkProFeature } = require('../middleware/proMiddleware');

// Protect all routes
router.use(authenticateJWT);

router.post('/', checkProFeature, skillController.analyzeUserSkillGap);
router.get('/', skillController.getSkillAnalysisHistory);

module.exports = router;
