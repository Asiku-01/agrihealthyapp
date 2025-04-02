const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './agrihealthapp.sqlite',
  logging: false
});

// Define models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('farmer', 'veterinarian', 'expert', 'admin'),
    defaultValue: 'farmer',
    allowNull: false
  }
});

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
    type: DataTypes.JSON,
    allowNull: false
  },
  causes: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  preventionMethods: {
    type: DataTypes.JSON,
    allowNull: false
  },
  treatmentMethods: {
    type: DataTypes.JSON,
    allowNull: false
  },
  optimalTemperature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    allowNull: false
  }
});

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
    type: DataTypes.JSON,
    allowNull: false
  },
  causes: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  preventionMethods: {
    type: DataTypes.JSON,
    allowNull: false
  },
  treatmentMethods: {
    type: DataTypes.JSON,
    allowNull: false
  },
  temperatureFactors: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  idealTemperature: {
    type: DataTypes.JSON,
    allowNull: true
  },
  zoonotic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    allowNull: false
  },
  incubationPeriod: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const Diagnosis = sequelize.define('Diagnosis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('plant', 'livestock'),
    allowNull: false
  },
  subjectType: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'tomato', 'cattle'
  },
  symptoms: {
    type: DataTypes.JSON,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  diagnosedDisease: {
    type: DataTypes.STRING,
    allowNull: true
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Sample data
const plantDiseases = [
  {
    name: 'Late Blight',
    plantType: 'tomato',
    description: 'Late blight is a potentially serious disease of potato and tomato, caused by the fungus-like organism Phytophthora infestans.',
    symptoms: [
      'Dark brown spots on leaves',
      'White fungal growth on undersides of leaves',
      'Brown lesions on stems',
      'Fruit rot with greasy appearance'
    ],
    causes: 'The disease is caused by the oomycete pathogen Phytophthora infestans. It thrives in cool, wet conditions.',
    preventionMethods: [
      'Use resistant varieties',
      'Provide good air circulation',
      'Avoid overhead irrigation',
      'Rotate crops'
    ],
    treatmentMethods: [
      'Apply fungicides preventatively',
      'Remove and destroy infected plants',
      'Copper-based sprays can help'
    ],
    optimalTemperature: '10-20°C',
    severity: 'high'
  },
  {
    name: 'Powdery Mildew',
    plantType: 'cucumber',
    description: 'Powdery mildew is a fungal disease that affects a wide range of plants, particularly cucurbits.',
    symptoms: [
      'White powdery spots on leaves and stems',
      'Yellow leaves',
      'Distorted leaves',
      'Premature leaf drop'
    ],
    causes: 'The disease is caused by several species of fungi. High humidity and moderate temperatures favor development.',
    preventionMethods: [
      'Plant resistant varieties',
      'Ensure proper spacing for air circulation',
      'Avoid overhead watering',
      'Remove plant debris'
    ],
    treatmentMethods: [
      'Apply fungicides',
      'Use neem oil or potassium bicarbonate',
      'Remove and destroy infected parts'
    ],
    optimalTemperature: '18-30°C',
    severity: 'medium'
  }
];

const livestockDiseases = [
  {
    name: 'Foot and Mouth Disease',
    animalType: 'cattle',
    description: 'Foot and mouth disease (FMD) is a highly contagious viral disease affecting cloven-hoofed animals.',
    symptoms: [
      'Fever',
      'Blisters on mouth and feet',
      'Excessive salivation',
      'Lameness',
      'Reduced milk production'
    ],
    causes: 'The disease is caused by the foot-and-mouth disease virus (FMDV). Highly contagious through direct and indirect contact.',
    preventionMethods: [
      'Vaccination',
      'Biosecurity measures',
      'Movement restrictions',
      'Quarantine new animals'
    ],
    treatmentMethods: [
      'No specific treatment',
      'Supportive care',
      'Anti-inflammatory medication',
      'Rest and soft food'
    ],
    temperatureFactors: 'Fever (104-106°F/40-41°C) is an early sign. Temperature monitoring is essential for early detection.',
    idealTemperature: [38.5, 39.5],
    zoonotic: false,
    severity: 'high',
    incubationPeriod: '2-14 days'
  },
  {
    name: 'Mastitis',
    animalType: 'dairy cow',
    description: 'Mastitis is an inflammation of the mammary gland and udder tissue in dairy animals.',
    symptoms: [
      'Swollen udder',
      'Pain and discomfort',
      'Abnormal milk (clots, watery)',
      'Reduced milk production',
      'Fever'
    ],
    causes: 'The disease is commonly caused by bacterial infections (Staphylococcus, Streptococcus, E. coli). Poor milking hygiene and injured teats increase risk.',
    preventionMethods: [
      'Good milking hygiene',
      'Proper milking technique',
      'Clean housing',
      'Teat dipping after milking'
    ],
    treatmentMethods: [
      'Antibiotics (intramammary or systemic)',
      'Anti-inflammatory drugs',
      'Frequent milking of affected quarters',
      'Supportive care'
    ],
    temperatureFactors: 'Mild to moderate fever (39-40°C) may be present. Higher environmental temperatures can increase stress and susceptibility.',
    idealTemperature: [38.5, 39.0],
    zoonotic: false,
    severity: 'medium',
    incubationPeriod: '1-3 days'
  }
];

const users = [
  {
    username: 'demo_farmer',
    email: 'farmer@example.com',
    password: '$2b$10$OPCrQ/Qh2c1cQS2OYGUCVeVE/FerTbC8J5zBJFcdHQXwr6iVjAA46', // hashed 'password123'
    location: 'Rural County',
    role: 'farmer'
  },
  {
    username: 'admin_user',
    email: 'admin@example.com',
    password: '$2b$10$OPCrQ/Qh2c1cQS2OYGUCVeVE/FerTbC8J5zBJFcdHQXwr6iVjAA46', // hashed 'password123'
    role: 'admin'
  }
];

// Initialize and seed database
const initAndSeedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Insert users
    await User.bulkCreate(users);
    console.log(`${users.length} users added`);

    // Insert plant diseases
    await PlantDisease.bulkCreate(plantDiseases);
    console.log(`${plantDiseases.length} plant diseases added`);

    // Insert livestock diseases
    await LivestockDisease.bulkCreate(livestockDiseases);
    console.log(`${livestockDiseases.length} livestock diseases added`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization function
initAndSeedDatabase();
