const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const JobAnalysis = sequelize.define('JobAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  jobDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  matchScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  missingSkills: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  suggestions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'job_analysis',
  timestamps: true,
});

module.exports = JobAnalysis;
