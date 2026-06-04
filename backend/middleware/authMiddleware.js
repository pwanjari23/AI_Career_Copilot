const { verifyAccessToken } = require('../utils/tokenUtils');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to verify JWT Access Token
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach payload (id, email, role)
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401, { code: 'TOKEN_EXPIRED' });
    }
    return errorResponse(res, 'Invalid authentication token', 401);
  }
};

/**
 * Middleware for Role Based Access Control (RBAC)
 * @param {...string} roles Permitted roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User identity context not found', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied: Insufficient privileges', 403);
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
