const ChatHistory = require('../models/chatHistory');
const { successResponse } = require('../utils/apiResponse');

/**
 * Fetch Chat History for authenticated user
 */
const getChatHistory = async (req, res, next) => {
  try {
    const history = await ChatHistory.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']],
    });

    return successResponse(res, 'Chat history retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

/**
 * Clear Chat History for authenticated user
 */
const clearChatHistory = async (req, res, next) => {
  try {
    await ChatHistory.destroy({
      where: { userId: req.user.id },
    });

    return successResponse(res, 'Chat history cleared successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChatHistory,
  clearChatHistory,
};
