const { sequelize } = require('../config/db');
const User = require('./user');
const Resume = require('./resume');
const JobAnalysis = require('./jobAnalysis');
const Interview = require('./interview');
const InterviewAnswer = require('./interviewAnswer');
const ChatHistory = require('./chatHistory');
const SkillAnalysis = require('./skillAnalysis');
const Roadmap = require('./roadmap');
const Payment = require('./payment');

// Define Relationships

// User <-> Resume
User.hasMany(Resume, { foreignKey: 'userId', onDelete: 'CASCADE' });
Resume.belongsTo(User, { foreignKey: 'userId' });

// User <-> JobAnalysis
User.hasMany(JobAnalysis, { foreignKey: 'userId', onDelete: 'CASCADE' });
JobAnalysis.belongsTo(User, { foreignKey: 'userId' });

// User <-> Interview
User.hasMany(Interview, { foreignKey: 'userId', onDelete: 'CASCADE' });
Interview.belongsTo(User, { foreignKey: 'userId' });

// Interview <-> InterviewAnswer
Interview.hasMany(InterviewAnswer, { foreignKey: 'interviewId', onDelete: 'CASCADE' });
InterviewAnswer.belongsTo(Interview, { foreignKey: 'interviewId' });

// User <-> ChatHistory
User.hasMany(ChatHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });
ChatHistory.belongsTo(User, { foreignKey: 'userId' });

// User <-> SkillAnalysis
User.hasMany(SkillAnalysis, { foreignKey: 'userId', onDelete: 'CASCADE' });
SkillAnalysis.belongsTo(User, { foreignKey: 'userId' });

// User <-> Roadmap
User.hasMany(Roadmap, { foreignKey: 'userId', onDelete: 'CASCADE' });
Roadmap.belongsTo(User, { foreignKey: 'userId' });

// User <-> Payment
User.hasMany(Payment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Payment.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Resume,
  JobAnalysis,
  Interview,
  InterviewAnswer,
  ChatHistory,
  SkillAnalysis,
  Roadmap,
  Payment,
};
