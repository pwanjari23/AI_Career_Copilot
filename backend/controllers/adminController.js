const User = require('../models/user');
const Resume = require('../models/resume');
const Interview = require('../models/interview');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalResumes = await Resume.count();
    const totalInterviews = await Interview.count();

    const resumeAtsStats = await Resume.findAll({
      attributes: ['atsScore'],
    });
    const avgAtsScore = resumeAtsStats.length > 0
      ? Math.round(resumeAtsStats.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumeAtsStats.length)
      : 0;

  
    const interviewStats = await Interview.findAll({
      attributes: ['overallScore'],
      where: { overallScore: { [require('sequelize').Op.ne]: null } },
    });
    const avgInterviewScore = interviewStats.length > 0
      ? Math.round(interviewStats.reduce((sum, i) => sum + i.overallScore, 0) / interviewStats.length)
      : 0;

    const users = await User.findAll({
      attributes: ['experienceLevel', 'targetRole'],
      where: { role: 'user' },
    });

    const experienceStats = {};
    const roleStats = {};

    users.forEach((u) => {
      const exp = u.experienceLevel || 'Not Specified';
      const role = u.targetRole || 'Not Specified';
      
      experienceStats[exp] = (experienceStats[exp] || 0) + 1;
      roleStats[role] = (roleStats[role] || 0) + 1;
    });

    return successResponse(res, 'Platform stats retrieved successfully', {
      cards: {
        totalUsers,
        totalResumes,
        totalInterviews,
        avgAtsScore,
        avgInterviewScore,
      },
      distributions: {
        experienceStats: Object.keys(experienceStats).map(name => ({ name, count: experienceStats[name] })),
        roleStats: Object.keys(roleStats).map(name => ({ name, count: roleStats[name] })),
      },
    });
  } catch (error) {
    next(error);
  }
};


const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'Users list retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

const toggleUserBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.role === 'admin') {
      return errorResponse(res, 'Administrators cannot be blocked', 400);
    }


    user.isBlocked = !user.isBlocked;
   
    if (user.isBlocked) {
      user.refreshToken = null;
    }
    
    await user.save();

    const actionText = user.isBlocked ? 'blocked' : 'unblocked';
    return successResponse(res, `User has been successfully ${actionText}`, {
      userId: user.id,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};


const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.role === 'admin') {
      return errorResponse(res, 'Administrators cannot be deleted', 400);
    }

    await user.destroy(); 
    return successResponse(res, 'User and associated data deleted successfully', { userId: id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
};
