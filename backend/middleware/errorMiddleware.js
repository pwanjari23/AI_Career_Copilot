const { errorResponse } = require('../utils/apiResponse');

/**
 * Express Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Exception Caught:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Database validation check failed';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle JWT error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  // Handle Multer upload size limits or format errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Uploaded file exceeds the maximum size limit (5MB)';
  }

  return errorResponse(res, message, statusCode, errors);
};

module.exports = errorHandler;
