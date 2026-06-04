const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const db = require('./models'); // Imports all models and associations
const { initSocket } = require('./services/socketService');
const errorHandler = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const skillRoutes = require('./routes/skillRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io Chatbot Service
initSocket(server);

// Middleware Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    if (allowedOrigins.includes(origin) || isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Static Uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AI Career Copilot Backend is healthy' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
async function startServer() {
  try {
    // 1. Verify and establish database pool
    await initializeDatabase();
    
    // 2. Sync database schema structures
    // In production, we'd use migrations. For deployment-ready ease, sync builds/alters tables automatically.
    await db.sequelize.sync({ alter: true });
    console.log('Database schemas synchronized successfully.');

    // 3. Start listening
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('Server bootstrapping failed:', error.message);
    process.exit(1);
  }
}

startServer();
