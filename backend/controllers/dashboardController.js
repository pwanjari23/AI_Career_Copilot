const Resume = require('../models/resume');
const Interview = require('../models/interview');
const SkillAnalysis = require('../models/skillAnalysis');
const Roadmap = require('../models/roadmap');
const JobAnalysis = require('../models/jobAnalysis');
const { successResponse } = require('../utils/apiResponse');

/**
 * Fetch stats summary and chart datasets for User Dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch latest resume
    const latestResume = await Resume.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // 2. Fetch interviews taken
    const interviews = await Interview.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    // 3. Fetch latest skill analysis
    const latestSkillGap = await SkillAnalysis.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // 4. Fetch latest roadmap
    const latestRoadmap = await Roadmap.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // 5. Fetch job description match history
    const jobMatches = await JobAnalysis.findAll({
      where: { userId },
    });

    // CALCULATE METRIC CARDS
    const resumeScore = latestResume ? latestResume.atsScore : 0;
    const totalInterviews = interviews.length;
    
    // Average interview score
    const gradedInterviews = interviews.filter((i) => i.overallScore !== null);
    const avgInterviewScore = gradedInterviews.length > 0
      ? Math.round(gradedInterviews.reduce((sum, i) => sum + i.overallScore, 0) / gradedInterviews.length)
      : 0;

    // Skill Gap calculation: percent of missing skills vs required skills
    let skillGapPercentage = 0;
    if (latestSkillGap) {
      const currentCount = Array.isArray(latestSkillGap.currentSkills) ? latestSkillGap.currentSkills.length : 0;
      const missingCount = Array.isArray(latestSkillGap.missingSkills) ? latestSkillGap.missingSkills.length : 0;
      const totalCount = currentCount + missingCount;
      if (totalCount > 0) {
        skillGapPercentage = Math.round((missingCount / totalCount) * 100);
      }
    }

    // Roadmap Progress: calculate percent of months completed dynamically
    let roadmapProgress = 0;
    if (latestRoadmap && Array.isArray(latestRoadmap.roadmapData)) {
      const completedCount = latestRoadmap.roadmapData.filter((step) => step.completed).length;
      roadmapProgress = Math.round((completedCount / latestRoadmap.roadmapData.length) * 100);
    }

    // CHARTS DATASETS

    // A. Interview Performance Chart (Chronological scores)
    const interviewChart = interviews.map((i) => ({
      category: i.category,
      score: i.overallScore || 0,
      date: i.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));

    // B. Skill Progress Chart (current vs missing skills count by target role)
    const skillChart = latestSkillGap ? {
      role: latestSkillGap.targetRole,
      currentCount: Array.isArray(latestSkillGap.currentSkills) ? latestSkillGap.currentSkills.length : 0,
      missingCount: Array.isArray(latestSkillGap.missingSkills) ? latestSkillGap.missingSkills.length : 0,
    } : {
      role: 'Not Analyzed Yet',
      currentCount: 0,
      missingCount: 0,
    };

    // C. Weekly Activity Chart (activities per day of the week)
    // Gather timestamps from resume uploads, interviews, job description matching
    const activityDays = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const countActivityDay = (record) => {
      const dayName = days[new Date(record.createdAt).getDay()];
      activityDays[dayName] = (activityDays[dayName] || 0) + 1;
    };

    const resumesHistory = await Resume.findAll({ where: { userId } });
    
    resumesHistory.forEach(countActivityDay);
    interviews.forEach(countActivityDay);
    jobMatches.forEach(countActivityDay);

    const weeklyActivityChart = Object.keys(activityDays).map((day) => ({
      day,
      count: activityDays[day],
    }));

    return successResponse(res, 'Dashboard metrics fetched successfully', {
      cards: {
        resumeScore,
        totalInterviews,
        avgInterviewScore,
        skillGapPercentage,
        roadmapProgress,
      },
      charts: {
        interviewChart,
        skillChart,
        weeklyActivityChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
