const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./User');

const Diagnosis = sequelize.define('Diagnosis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('plant', 'livestock'),
    allowNull: false
  },
  speciesName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Plant type or animal species'
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('symptoms');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('symptoms', JSON.stringify(value));
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Temperature recorded during diagnosis (Celsius)'
  },
  diagnosisResult: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Disease name identified'
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'ML model confidence score (0-1)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'expert_review'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expertAdvice: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatmentPlan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Associations
Diagnosis.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Diagnosis, { foreignKey: 'userId' });

module.exports = Diagnosis;
