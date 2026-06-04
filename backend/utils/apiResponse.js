/**
 * Formats a standardized successful API response
 * @param {object} res Express response object
 * @param {string} message Description of the operation
 * @param {any} data Response load
 * @param {number} statusCode HTTP status code (default: 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Formats a standardized error API response
 * @param {object} res Express response object
 * @param {string} message Error description
 * @param {number} statusCode HTTP status code (default: 500)
 * @param {any} errors Specific validation details or stack references
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
