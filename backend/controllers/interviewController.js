const Interview = require('../models/interview');
const InterviewAnswer = require('../models/interviewAnswer');
const { generateInterviewQuestions, evaluateInterviewAnswer } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const ALLOWED_CATEGORIES = [
  'Frontend Developer',
  'React Developer',
  'MERN Developer',
  'Node Developer',
  'Java Developer',
  'Python Developer',
];

/**
 * Step 1 & 2: Start a new Mock Interview and generate 10 questions
 */
const startInterview = async (req, res, next) => {
  try {
    const { category } = req.body;

    if (!category) {
      return errorResponse(res, 'Interview category is required', 400);
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return errorResponse(res, `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`, 400);
    }

    // 1. Create a parent interview record
    const interview = await Interview.create({
      userId: req.user.id,
      category,
      overallScore: null, // calculated after completion
    });

    // 2. Generate 10 questions using Gemini
    const questions = await generateInterviewQuestions(category);

    // Ensure we have exactly 10 questions or fallback
    const finalQuestions = questions.slice(0, 10);

    // 3. Store questions in interview_answers table with empty responses
    const answersRecords = await Promise.all(
      finalQuestions.map((question) => {
        return InterviewAnswer.create({
          interviewId: interview.id,
          question,
          answer: '',
          aiFeedback: '',
          score: 0,
        });
      })
    );

    return successResponse(res, 'Interview initialized successfully', {
      interviewId: interview.id,
      category: interview.category,
      questions: answersRecords.map((rec) => ({
        id: rec.id,
        question: rec.question,
      })),
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Step 4 & 5: Submit an answer to a question, evaluate using Gemini, and store feedback
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { id: interviewId } = req.params;
    const { answerId, answer } = req.body;

    if (!answerId || !answer || answer.trim().length === 0) {
      return errorResponse(res, 'Answer ID and non-empty answer are required', 400);
    }

    // Heuristic validation for meaningful/valid answers
    const trimmedAnswer = answer.trim();
    const hasLetter = /[a-zA-Z]/.test(trimmedAnswer);
    const firstChar = trimmedAnswer[0];
    const isAllSameChar = trimmedAnswer.split('').every(c => c === firstChar);
    const isSingleLongWordGibberish = trimmedAnswer.indexOf(' ') === -1 && trimmedAnswer.length > 15;

    if (trimmedAnswer.length < 5 || !hasLetter || isAllSameChar || isSingleLongWordGibberish) {
      return errorResponse(res, 'Please enter a valid, meaningful answer (avoid gibberish or extremely short inputs).', 400);
    }

    // 1. Verify that the interview and question exist and belong to the user
    const interview = await Interview.findOne({
      where: { id: interviewId, userId: req.user.id },
    });

    if (!interview) {
      return errorResponse(res, 'Interview session not found or access denied', 404);
    }

    const questionRecord = await InterviewAnswer.findOne({
      where: { id: answerId, interviewId },
    });

    if (!questionRecord) {
      return errorResponse(res, 'Question not found in this interview session', 404);
    }

    // 2. Call Gemini service to evaluate the user's answer
    const evaluation = await evaluateInterviewAnswer(questionRecord.question, answer);

    // 3. Update the interview answer record
    questionRecord.answer = answer;
    questionRecord.aiFeedback = evaluation.aiFeedback || '';
    questionRecord.score = evaluation.overallScore || 0;
    questionRecord.correctnessScore = evaluation.correctnessScore || 0;
    questionRecord.technicalDepthScore = evaluation.technicalDepthScore || 0;
    questionRecord.communicationScore = evaluation.communicationScore || 0;
    await questionRecord.save();

    // 4. Check if all questions in this interview have been answered
    const allQuestions = await InterviewAnswer.findAll({ where: { interviewId } });
    const answeredCount = allQuestions.filter((q) => q.answer && q.answer.trim() !== '').length;

    // If all questions are answered, calculate the global overall score
    if (answeredCount === allQuestions.length) {
      const totalScore = allQuestions.reduce((sum, q) => sum + q.score, 0);
      const averageScore = Math.round(totalScore / allQuestions.length);
      
      interview.overallScore = averageScore;
      await interview.save();
    }

    return successResponse(res, 'Answer evaluated successfully', {
      questionRecord,
      completed: answeredCount === allQuestions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a single interview including all questions and answers
 */
const getInterviewDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: InterviewAnswer,
          order: [['id', 'ASC']],
        },
      ],
    });

    if (!interview) {
      return errorResponse(res, 'Interview not found or access denied', 404);
    }

    return successResponse(res, 'Interview details retrieved successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all interviews taken by user
 */
const getUserInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'User interviews retrieved successfully', interviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  getInterviewDetails,
  getUserInterviews,
};
