const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken
} = require('../utils/tokenUtils');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email address is already in use', 400);
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'user', // default user role
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email asynchronously
    sendWelcomeEmail(user.email, user.fullName);

    // Store refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, 'Registration successful', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
      },
      accessToken,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (user.isBlocked) {
      return errorResponse(res, 'Your account is blocked. Please contact support.', 403);
    }

    // Match Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Store refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 'Login successful', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token using Refresh Token
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return errorResponse(res, 'Refresh token is missing', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    // Find user and match token
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== token) {
      return errorResponse(res, 'Session expired or invalidated', 401);
    }

    if (user.isBlocked) {
      return errorResponse(res, 'Your account is blocked. Please contact support.', 403);
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 'Token refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user (invalidate refresh token)
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      // Find user and erase refresh token
      const user = await User.findOne({ where: { refreshToken: token } });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    // Clear client-side cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return successResponse(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'No account found with this email address', 404);
    }

    // Generate password reset token valid for 15 minutes
    const token = generateResetToken(user.email);
    
    // Build reset password link pointing to the React frontend route
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // Send the email containing the link
    await sendResetPasswordEmail(user.email, user.fullName, resetLink);

    return successResponse(res, 'A password reset link has been sent to your email address.');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Verify reset token validity and expiration
    let decoded;
    try {
      decoded = verifyResetToken(token);
    } catch (err) {
      return errorResponse(res, 'The reset link is invalid or has expired. Please try again.', 400);
    }

    // Find the user mapped to the verified email
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return errorResponse(res, 'User no longer exists', 404);
    }

    // Hash the new password and update user record
    user.password = await bcrypt.hash(password, 10);
    user.refreshToken = null; // force full re-login
    await user.save();

    return successResponse(res, 'Your password has been reset successfully. You may now sign in.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get active user details
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refreshToken'] },
    });
    
    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    return successResponse(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, targetRole, experienceLevel } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Update attributes
    if (fullName) user.fullName = fullName;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;

    // Check if a profile image was uploaded
    if (req.file) {
      // In production, upload to Cloudinary or AWS S3. Here we store the local path
      const filePath = `/uploads/${req.file.filename}`;
      user.profileImage = filePath;
    }

    await user.save();

    // Fetch updated user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'refreshToken'] },
    });

    return successResponse(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Change authenticated user's password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect current password', 400);
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Log in / Sign up using Google OAuth ID Token
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return errorResponse(res, 'Google ID Token credential is required', 400);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return errorResponse(res, 'Google OAuth Client ID is not configured on the server', 500);
    }

    const client = new OAuth2Client(clientId);
    
    // Verify ID Token with Google's public key signatures
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error('Google ID token verification failed:', err.message);
      return errorResponse(res, 'Invalid or expired Google credential', 400);
    }

    const { email, name, picture } = payload;
    if (!email) {
      return errorResponse(res, 'Email not provided by Google account', 400);
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      // Create a new user since they signed in with Google for the first time
      // Generate a strong random password placeholder
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullName: name || 'Google User',
        email,
        password: hashedPassword,
        profileImage: picture || null,
        role: 'user',
      });
      isNewUser = true;
    } else {
      // User exists. Update their avatar if it was empty, or check if blocked
      if (user.isBlocked) {
        return errorResponse(res, 'Your account is blocked. Please contact support.', 403);
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        await user.save();
      }
    }

    // Generate session tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Send welcome email if they are a new user
    if (isNewUser) {
      sendWelcomeEmail(user.email, user.fullName);
    }

    // Store refresh token in HttpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 'Google authentication successful', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  googleLogin,
};

