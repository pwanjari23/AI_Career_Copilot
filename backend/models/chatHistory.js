const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChatHistory = sequelize.define('ChatHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'chat_history',
  timestamps: true,
});

module.exports = ChatHistory;
