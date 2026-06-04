const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Validates request schema parameters, formats errors, and stops request pipeline on failure
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format error messages
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    return errorResponse(res, 'Validation checks failed', 400, formattedErrors);
  }
  next();
};

module.exports = validateRequest;
