const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all routes: Must be Authenticated AND have Role: Admin
router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

router.get('/stats', adminController.getPlatformStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/block', adminController.toggleUserBlock);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
