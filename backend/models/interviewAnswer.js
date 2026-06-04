const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InterviewAnswer = sequelize.define('InterviewAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  interviewId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  aiFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  correctnessScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  technicalDepthScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  communicationScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'interview_answers',
  timestamps: true,
});

module.exports = InterviewAnswer;
