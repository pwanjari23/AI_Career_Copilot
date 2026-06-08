const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../middleware/uploadMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  profileUpdateValidator,
  changePasswordValidator,
} = require('../validators/authValidator');

// Public Auth Endpoints
router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, authController.resetPassword);
router.post('/google', authController.googleLogin);

// Protected Auth Endpoints
router.get('/profile', authenticateJWT, authController.getProfile);
router.post(
  '/change-password',
  authenticateJWT,
  changePasswordValidator,
  validateRequest,
  authController.changePassword
);
router.put(
  '/profile',
  authenticateJWT,
  uploadProfileImage,
  profileUpdateValidator,
  validateRequest,
  authController.updateProfile
);

module.exports = router;
