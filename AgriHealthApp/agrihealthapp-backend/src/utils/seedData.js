const { PlantDisease, LivestockDisease, sequelize } = require('../models');
require('dotenv').config();

// Sample plant diseases
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
  },
  {
    name: 'Anthracnose',
    plantType: 'mango',
    description: 'Anthracnose is a common disease of mangoes affecting leaves, flowers, and fruit.',
    symptoms: [
      'Dark, sunken lesions on fruit',
      'Black spots on leaves',
      'Flower blight',
      'Twig dieback'
    ],
    causes: 'The disease is caused by Colletotrichum gloeosporioides fungus. Warm, wet conditions favor development.',
    preventionMethods: [
      'Prune trees for better air circulation',
      'Remove fallen debris',
      'Apply preventative fungicides',
      'Harvest fruit at proper maturity'
    ],
    treatmentMethods: [
      'Apply copper-based fungicides',
      'Postharvest hot water treatment',
      'Careful handling to avoid wounds'
    ],
    optimalTemperature: '25-30°C',
    severity: 'medium'
  },
  {
    name: 'Bacterial Leaf Blight',
    plantType: 'rice',
    description: 'Bacterial leaf blight is a serious disease of rice caused by Xanthomonas oryzae.',
    symptoms: [
      'Water-soaked lesions on leaf edges',
      'Lesions turning yellow to white',
      'Wilting of leaves',
      'Dried leaves'
    ],
    causes: 'The disease is caused by the bacterium Xanthomonas oryzae pv. oryzae. High humidity and high temperatures favor development.',
    preventionMethods: [
      'Use resistant varieties',
      'Proper field drainage',
      'Balanced fertilization',
      'Proper spacing'
    ],
    treatmentMethods: [
      'Application of copper-based bactericides',
      'Drain fields to reduce humidity',
      'Remove and destroy infected plants'
    ],
    optimalTemperature: '25-34°C',
    severity: 'high'
  },
  {
    name: 'Corn Rust',
    plantType: 'corn',
    description: 'Corn rust is a fungal disease that affects corn production worldwide.',
    symptoms: [
      'Orange-brown pustules on leaves',
      'Pustules turn dark brown-black',
      'Severe infections cause leaf death',
      'Reduced grain yield'
    ],
    causes: 'The disease is caused by Puccinia sorghi or Puccinia polysora fungi. Warm, humid conditions favor development.',
    preventionMethods: [
      'Plant resistant hybrids',
      'Crop rotation',
      'Early planting',
      'Destroy volunteer corn'
    ],
    treatmentMethods: [
      'Apply fungicides',
      'Improve air circulation',
      'Proper plant nutrition'
    ],
    optimalTemperature: '16-25°C',
    severity: 'medium'
  }
];

// Sample livestock diseases
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
    name: 'Avian Influenza',
    animalType: 'poultry',
    description: 'Avian influenza is a highly contagious viral infection affecting birds, especially poultry.',
    symptoms: [
      'Sudden death',
      'Lack of energy and appetite',
      'Decreased egg production',
      'Swelling of head and comb',
      'Respiratory distress'
    ],
    causes: 'The disease is caused by Influenza A viruses. Spreads through direct contact with infected birds or contaminated surfaces.',
    preventionMethods: [
      'Biosecurity measures',
      'Isolation of new birds',
      'Limiting contact with wild birds',
      'Regular cleaning and disinfection'
    ],
    treatmentMethods: [
      'No specific treatment',
      'Culling of infected flocks',
      'Supportive care for valuable birds'
    ],
    temperatureFactors: 'Birds may show elevated body temperature. Virus survives better in cooler temperatures.',
    idealTemperature: [40.6, 41.7],
    zoonotic: true,
    severity: 'high',
    incubationPeriod: '3-7 days'
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
  },
  {
    name: 'African Swine Fever',
    animalType: 'pig',
    description: 'African swine fever (ASF) is a highly contagious viral disease affecting domestic and wild pigs.',
    symptoms: [
      'High fever',
      'Loss of appetite',
      'Hemorrhages in skin and internal organs',
      'Vomiting and diarrhea',
      'Sudden death'
    ],
    causes: 'The disease is caused by the African swine fever virus (ASFV). Spreads through direct contact, vectors (ticks), or contaminated feed.',
    preventionMethods: [
      'Strict biosecurity measures',
      'Proper disposal of dead pigs',
      'Control of tick vectors',
      'Movement restrictions'
    ],
    treatmentMethods: [
      'No treatment available',
      'Infected pigs must be culled',
      'Area disinfection'
    ],
    temperatureFactors: 'High fever (40.5-42°C) is a characteristic sign. Monitoring temperature can help with early detection.',
    idealTemperature: [38.0, 39.0],
    zoonotic: false,
    severity: 'high',
    incubationPeriod: '5-15 days'
  },
  {
    name: 'Bluetongue',
    animalType: 'sheep',
    description: 'Bluetongue is a non-contagious, insect-borne viral disease affecting sheep and occasionally cattle and goats.',
    symptoms: [
      'Fever',
      'Swelling of the face and tongue',
      'Blue discoloration of the tongue',
      'Nasal discharge and drooling',
      'Lameness'
    ],
    causes: 'The disease is caused by the bluetongue virus, transmitted by Culicoides biting midges.',
    preventionMethods: [
      'Vaccination in endemic areas',
      'Control of insect vectors',
      'Housing animals during peak vector activity',
      'Insect repellents'
    ],
    treatmentMethods: [
      'No specific treatment',
      'Supportive care',
      'Anti-inflammatory drugs',
      'Soft food and water'
    ],
    temperatureFactors: 'Fever (40-42°C) often precedes other clinical signs. Temperature monitoring is important for early detection.',
    idealTemperature: [38.5, 39.5],
    zoonotic: false,
    severity: 'medium',
    incubationPeriod: '7-10 days'
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    // Sync database - force true will drop tables if they exist
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Insert plant diseases
    await PlantDisease.bulkCreate(plantDiseases);
    console.log(`${plantDiseases.length} plant diseases added`);

    // Insert livestock diseases
    await LivestockDisease.bulkCreate(livestockDiseases);
    console.log(`${livestockDiseases.length} livestock diseases added`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
