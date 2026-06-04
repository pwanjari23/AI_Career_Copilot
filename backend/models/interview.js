const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  overallScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'interviews',
  timestamps: true,
});

module.exports = Interview;
