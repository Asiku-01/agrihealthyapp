const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const PlantDisease = sequelize.define('PlantDisease', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plantType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
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
  causes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preventionMethods: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('preventionMethods');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('preventionMethods', JSON.stringify(value));
    }
  },
  treatmentMethods: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('treatmentMethods');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('treatmentMethods', JSON.stringify(value));
    }
  },
  imageUrls: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('imageUrls');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('imageUrls', JSON.stringify(value));
    }
  },
  optimalTemperature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  }
});

module.exports = PlantDisease;
