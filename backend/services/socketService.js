const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokenUtils');
const ChatHistory = require('../models/chatHistory');
const { getChatbotResponse } = require('./geminiService');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware for Sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication failed: Token missing'));
      }

      // Verify token
      const decoded = verifyAccessToken(token);
      socket.user = decoded; // Attach user info to socket
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      return next(new Error('Authentication failed: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to chatbot: ${socket.user.id} (Socket: ${socket.id})`);

    // Join a private room for this user
    const roomName = `user_chat_${socket.user.id}`;
    socket.join(roomName);

    // Listen for messages
    socket.on('send_message', async (data) => {
      try {
        const { message } = data;
        if (!message || message.trim().length === 0) {
          return socket.emit('chat_error', { message: 'Message content cannot be empty' });
        }

        // 1. Fetch user's previous 10 chat messages to maintain context
        const dbHistory = await ChatHistory.findAll({
          where: { userId: socket.user.id },
          limit: 10,
          order: [['createdAt', 'ASC']],
        });

        // 2. Format history for Gemini API
        // Format: [{ role: 'user' | 'model', text: '...' }]
        const chatHistoryForGemini = [];
        dbHistory.forEach((h) => {
          chatHistoryForGemini.push({ role: 'user', text: h.message });
          chatHistoryForGemini.push({ role: 'model', text: h.response });
        });

        // Emit typing status back to client
        socket.emit('typing', { typing: true });

        // 3. Ask Gemini for reply
        const aiResponseText = await getChatbotResponse(chatHistoryForGemini, message);

        // Turn off typing status
        socket.emit('typing', { typing: false });

        // 4. Save to chat history table
        const chatRecord = await ChatHistory.create({
          userId: socket.user.id,
          message,
          response: aiResponseText,
        });

        // 5. Emit message details back to the user room
        io.to(roomName).emit('receive_message', {
          id: chatRecord.id,
          message: chatRecord.message,
          response: chatRecord.response,
          createdAt: chatRecord.createdAt,
        });
      } catch (err) {
        console.error('Socket message handling error:', err.message);
        socket.emit('typing', { typing: false });
        socket.emit('chat_error', { message: 'Failed to process message: ' + err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id} (Socket: ${socket.id})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
