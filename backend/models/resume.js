const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  atsScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  extractedSkills: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  education: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  projects: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  experience: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  missingSkills: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  suggestions: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'resumes',
  timestamps: true,
});

module.exports = Resume;
