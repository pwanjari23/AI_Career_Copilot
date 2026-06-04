const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');

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

/**
 * Handle password recovery (Forgot Password)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'No account found with this email address', 404);
    }

    // Simulated flow: in production, send an email. For demo purposes, we log it and return success
    console.log(`Password reset requested for email: ${email}`);
    
    return successResponse(res, 'Password reset instructions have been logged. You may now reset your password.');
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Hash and update password
    user.password = await bcrypt.hash(password, 10);
    user.refreshToken = null; // force relogin
    await user.save();

    return successResponse(res, 'Password has been reset successfully. Please login.');
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

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};
