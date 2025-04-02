const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const LivestockDisease = sequelize.define('LivestockDisease', {
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
  animalType: {
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
  temperatureFactors: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'How temperature affects this disease'
  },
  idealTemperature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Range of temperature (in celsius) that is ideal for animals with this disease',
    get() {
      const value = this.getDataValue('idealTemperature');
      return value ? JSON.parse(value) : [null, null];
    },
    set(value) {
      this.setDataValue('idealTemperature', JSON.stringify(value));
    }
  },
  zoonotic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether disease can be transmitted to humans'
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  },
  incubationPeriod: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = LivestockDisease;
