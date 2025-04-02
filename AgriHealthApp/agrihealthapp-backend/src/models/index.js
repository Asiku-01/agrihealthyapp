const User = require('./User');
const PlantDisease = require('./PlantDisease');
const LivestockDisease = require('./LivestockDisease');
const Diagnosis = require('./Diagnosis');
const sequelize = require('../utils/database');

// Define any additional associations here if needed

// Initialize database with models
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  User,
  PlantDisease,
  LivestockDisease,
  Diagnosis,
  sequelize,
  initializeDatabase
};
