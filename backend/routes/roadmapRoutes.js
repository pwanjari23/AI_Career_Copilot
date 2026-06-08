const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const { checkProFeature } = require('../middleware/proMiddleware');

// Protect all routes
router.use(authenticateJWT);

router.post('/', checkProFeature, roadmapController.generateUserRoadmap);
router.get('/', roadmapController.getUserRoadmaps);
router.get('/latest', roadmapController.getLatestRoadmap);
router.put('/:id/toggle-month', roadmapController.toggleRoadmapMonth);

module.exports = router;
