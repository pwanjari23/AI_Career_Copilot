const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Roadmap = sequelize.define('Roadmap', {
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
  roadmapData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  tableName: 'roadmaps',
  timestamps: true,
});

module.exports = Roadmap;
