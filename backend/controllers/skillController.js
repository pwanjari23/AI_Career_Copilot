const SkillAnalysis = require('../models/skillAnalysis');
const Resume = require('../models/resume');
const { analyzeSkillGap } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Perform Skill Gap Analysis
 */
const analyzeUserSkillGap = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    let { currentSkills } = req.body;

    if (!targetRole || targetRole.trim().length === 0) {
      return errorResponse(res, 'Target role is required', 400);
    }

    // 1. If currentSkills not provided in body, extract from user's latest resume
    if (!currentSkills || (Array.isArray(currentSkills) && currentSkills.length === 0)) {
      const latestResume = await Resume.findOne({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
      });
      
      if (latestResume && latestResume.extractedSkills) {
        currentSkills = latestResume.extractedSkills;
      } else {
        currentSkills = [];
      }
    }

    const currentSkillsStr = Array.isArray(currentSkills) ? currentSkills.join(', ') : currentSkills;

    // 2. Call Gemini for gap analysis
    const aiAnalysis = await analyzeSkillGap(targetRole, currentSkillsStr);

    // 3. Save to database
    const gapRecord = await SkillAnalysis.create({
      userId: req.user.id,
      targetRole,
      currentSkills: aiAnalysis.currentSkills || [],
      missingSkills: aiAnalysis.missingSkills || [],
      recommendations: aiAnalysis.recommendations || '',
    });

    return successResponse(res, 'Skill gap analysis completed successfully', gapRecord, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get skill gap analysis history
 */
const getSkillAnalysisHistory = async (req, res, next) => {
  try {
    const history = await SkillAnalysis.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'Skill gap analysis history retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeUserSkillGap,
  getSkillAnalysisHistory,
};
