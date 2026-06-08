require('dotenv').config();
const { sequelize } = require('./config/db');

async function test() {
  try {
    const [results] = await sequelize.query("DESCRIBE resumes");
    console.log("Resumes Table Schema:");
    results.forEach(row => {
      console.log(` - ${row.Field}: ${row.Type}`);
    });
  } catch (error) {
    console.error("DB Query failed:", error);
  } finally {
    await sequelize.close();
  }
}

test();
