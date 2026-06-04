const JobAnalysis = require('../models/jobAnalysis');
const Resume = require('../models/resume');
const { analyzeJobMatch } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Compare User's latest resume against a Job Description
 */
const compareJobDescription = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length === 0) {
      return errorResponse(res, 'Job description text is required', 400);
    }

    // 1. Fetch user's latest resume
    const latestResume = await Resume.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!latestResume) {
      return errorResponse(res, 'Please upload your resume in the Resume Analyzer module first before analyzing job descriptions.', 400);
    }

    // 2. Prepare resume summary for AI comparison
    const resumeTextSummary = `
      ATS Score: ${latestResume.atsScore}
      Extracted Skills: ${(latestResume.extractedSkills || []).join(', ')}
      Feedback: ${latestResume.feedback}
      Education: ${JSON.stringify(latestResume.education || [])}
      Projects: ${JSON.stringify(latestResume.projects || [])}
      Experience: ${JSON.stringify(latestResume.experience || [])}
    `;

    // 3. Call AI service to compare
    const aiAnalysis = await analyzeJobMatch(resumeTextSummary, jobDescription);

    // 4. Save analysis record
    const analysisRecord = await JobAnalysis.create({
      userId: req.user.id,
      jobDescription,
      matchScore: aiAnalysis.matchScore || 0,
      missingSkills: aiAnalysis.missingSkills || [],
      suggestions: aiAnalysis.suggestions || '',
    });

    return successResponse(res, 'Job description analysis completed successfully', analysisRecord, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get job match analysis history for the user
 */
const getJobAnalysisHistory = async (req, res, next) => {
  try {
    const history = await JobAnalysis.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'Job analysis history retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  compareJobDescription,
  getJobAnalysisHistory,
};
