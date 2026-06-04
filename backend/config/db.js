const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_career_copilot',
  port: process.env.DB_PORT || 3306,
};

let sequelize;

async function initializeDatabase() {
  try {
    // Connect to MySQL server first to check/create database
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await connection.end();
    console.log(`Database '${dbConfig.database}' verified/created.`);

    // Initialize Sequelize
    sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'mysql',
      logging: false, // Set to console.log in dev if debugging SQL queries is needed
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    return sequelize;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}

// Instantiate fallback Sequelize object for imports before initialization
const fallbackSequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'mysql',
  logging: false,
});

module.exports = {
  initializeDatabase,
  sequelize: fallbackSequelize, // Export base instance for schemas
};
