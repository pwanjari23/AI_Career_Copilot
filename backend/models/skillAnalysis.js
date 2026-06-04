const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SkillAnalysis = sequelize.define('SkillAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currentSkills: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  missingSkills: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'skill_analysis',
  timestamps: true,
});

module.exports = SkillAnalysis;
