const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Protect dashboard route
router.get('/', authenticateJWT, dashboardController.getDashboardStats);

module.exports = router;
