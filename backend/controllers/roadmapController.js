const Roadmap = require('../models/roadmap');
const SkillAnalysis = require('../models/skillAnalysis');
const { generateRoadmap } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Generate Personalized study roadmap
 */
const generateUserRoadmap = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    let { missingSkills } = req.body;

    if (!targetRole || targetRole.trim().length === 0) {
      return errorResponse(res, 'Target role is required', 400);
    }

    // 1. Fetch missing skills if not provided
    if (!missingSkills || (Array.isArray(missingSkills) && missingSkills.length === 0)) {
      // Find latest skill gap analysis for this role
      const skillGap = await SkillAnalysis.findOne({
        where: { userId: req.user.id, targetRole },
        order: [['createdAt', 'DESC']],
      });

      if (skillGap && skillGap.missingSkills) {
        missingSkills = skillGap.missingSkills;
      } else {
        missingSkills = [];
      }
    }

    const missingSkillsStr = Array.isArray(missingSkills) ? missingSkills.join(', ') : missingSkills;

    // 2. Call Gemini service to generate 6-month roadmap data
    const rawRoadmapData = await generateRoadmap(targetRole, missingSkillsStr);

    // Append completed status flag for frontend tracker
    const roadmapData = (rawRoadmapData || []).map((step) => ({
      ...step,
      completed: false,
    }));

    // 3. Save roadmap to database
    const newRoadmap = await Roadmap.create({
      userId: req.user.id,
      targetRole,
      roadmapData,
    });

    return successResponse(res, 'Roadmap generated successfully', newRoadmap, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle completion of a specific month in a roadmap
 */
const toggleRoadmapMonth = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monthIndex } = req.body;

    if (monthIndex === undefined || monthIndex < 0 || monthIndex > 5) {
      return errorResponse(res, 'Valid month index (0-5) is required', 400);
    }

    const roadmap = await Roadmap.findOne({
      where: { id, userId: req.user.id },
    });

    if (!roadmap) {
      return errorResponse(res, 'Roadmap not found', 404);
    }

    // Toggle the completed status
    const data = [...roadmap.roadmapData];
    if (data[monthIndex]) {
      data[monthIndex].completed = !data[monthIndex].completed;
    }

    roadmap.roadmapData = data;
    roadmap.changed('roadmapData', true); // Tell Sequelize JSON field changed
    await roadmap.save();

    return successResponse(res, 'Roadmap milestone toggled successfully', roadmap);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all roadmaps
 */
const getUserRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'Roadmaps retrieved successfully', roadmaps);
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest roadmap
 */
const getLatestRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!roadmap) {
      return successResponse(res, 'No roadmap generated yet', null);
    }

    return successResponse(res, 'Latest roadmap retrieved successfully', roadmap);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateUserRoadmap,
  getUserRoadmaps,
  getLatestRoadmap,
  toggleRoadmapMonth,
};
