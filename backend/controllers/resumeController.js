const Resume = require('../models/resume');
const { parsePdf } = require('../services/pdfService');
const { analyzeResume } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Upload, parse, and analyze resume PDF
 */
const uploadAndAnalyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No resume file uploaded', 400);
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;

    // 1. Extract text from PDF
    const textContent = await parsePdf(filePath);

    if (!textContent || textContent.trim().length === 0) {
      return errorResponse(res, 'Could not extract text from the PDF file. Ensure it is not scanned or empty.', 400);
    }

    // 2. Perform Gemini AI analysis
    const aiAnalysis = await analyzeResume(textContent);

    // 3. Save to database
    const resumeRecord = await Resume.create({
      userId: req.user.id,
      resumeUrl: fileUrl,
      atsScore: aiAnalysis.atsScore || 0,
      extractedSkills: aiAnalysis.extractedSkills || [],
      feedback: aiAnalysis.feedback || '',
      education: aiAnalysis.education || [],
      projects: aiAnalysis.projects || [],
      experience: aiAnalysis.experience || [],
    });

    return successResponse(res, 'Resume analyzed and stored successfully', resumeRecord, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all resumes for the authenticated user
 */
const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'User resumes retrieved successfully', resumes);
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest resume details
 */
const getLatestResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!resume) {
      return successResponse(res, 'No resume uploaded yet', null);
    }

    return successResponse(res, 'Latest resume retrieved successfully', resume);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndAnalyzeResume,
  getUserResumes,
  getLatestResume,
};
