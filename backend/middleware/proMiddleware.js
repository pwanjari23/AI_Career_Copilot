const User = require('../models/user');
const Resume = require('../models/resume');
const Interview = require('../models/interview');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Helper to fetch latest isPro status from database
 */
const checkUserProStatus = async (req) => {
  if (!req.user || !req.user.id) return false;
  
  // Admins bypass all tier limits
  if (req.user.role === 'admin') return true;

  const user = await User.findByPk(req.user.id);
  return user ? user.isPro : false;
};

/**
 * Enforce Starter limit: Max 3 Resume Analyses
 */
const checkResumeLimit = async (req, res, next) => {
  try {
    const isPro = await checkUserProStatus(req);
    if (isPro) {
      return next();
    }

    const count = await Resume.count({ where: { userId: req.user.id } });
    if (count >= 3) {
      return errorResponse(
        res,
        'You have reached the limit of 3 resume analyses on the Starter plan. Please upgrade to Pro for unlimited uploads.',
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enforce Starter limit: Max 2 Mock Interviews
 */
const checkInterviewLimit = async (req, res, next) => {
  try {
    const isPro = await checkUserProStatus(req);
    if (isPro) {
      return next();
    }

    const count = await Interview.count({ where: { userId: req.user.id } });
    if (count >= 2) {
      return errorResponse(
        res,
        'You have reached the limit of 2 mock interview sessions on the Starter plan. Please upgrade to Pro for unlimited sessions.',
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enforce Pro-only features: Roadmap, Skill Gap, Job Matching
 */
const checkProFeature = async (req, res, next) => {
  try {
    const isPro = await checkUserProStatus(req);
    if (isPro) {
      return next();
    }

    return errorResponse(
      res,
      'This premium feature is only available to Pro users. Please upgrade to Pro to unlock access.',
      403
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkResumeLimit,
  checkInterviewLimit,
  checkProFeature,
};
