const { PlantDisease, LivestockDisease, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all diseases by type (plant or livestock)
exports.getDiseasesByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (type !== 'plant' && type !== 'livestock') {
      return res.status(400).json({
        message: 'Invalid type. Must be "plant" or "livestock"'
      });
    }

    let diseases;
    if (type === 'plant') {
      diseases = await PlantDisease.findAll({
        order: [['name', 'ASC']]
      });
    } else {
      diseases = await LivestockDisease.findAll({
        order: [['name', 'ASC']]
      });
    }

    res.status(200).json({ diseases });
  } catch (error) {
    console.error('Get diseases error:', error);
    res.status(500).json({
      message: 'Error fetching diseases',
      error: error.message
    });
  }
};

// Get diseases filtered by plant/animal type
exports.getDiseasesBySpecies = async (req, res) => {
  try {
    const { type, species } = req.params;

    if (type !== 'plant' && type !== 'livestock') {
      return res.status(400).json({
        message: 'Invalid type. Must be "plant" or "livestock"'
      });
    }

    if (!species) {
      return res.status(400).json({
        message: 'Species parameter is required'
      });
    }

    let diseases;
    if (type === 'plant') {
      diseases = await PlantDisease.findAll({
        where: { plantType: species },
        order: [['name', 'ASC']]
      });
    } else {
      diseases = await LivestockDisease.findAll({
        where: { animalType: species },
        order: [['name', 'ASC']]
      });
    }

    res.status(200).json({ diseases });
  } catch (error) {
    console.error('Get diseases by species error:', error);
    res.status(500).json({
      message: 'Error fetching diseases',
      error: error.message
    });
  }
};

// Get specific disease by ID
exports.getDiseaseById = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type !== 'plant' && type !== 'livestock') {
      return res.status(400).json({
        message: 'Invalid type. Must be "plant" or "livestock"'
      });
    }

    let disease;
    if (type === 'plant') {
      disease = await PlantDisease.findByPk(id);
    } else {
      disease = await LivestockDisease.findByPk(id);
    }

    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.status(200).json({ disease });
  } catch (error) {
    console.error('Get disease by ID error:', error);
    res.status(500).json({
      message: 'Error fetching disease',
      error: error.message
    });
  }
};

// Search diseases by name or keyword
exports.searchDiseases = async (req, res) => {
  try {
    const { type, query } = req.params;

    if (!query || query.length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters'
      });
    }

    if (type !== 'plant' && type !== 'livestock' && type !== 'all') {
      return res.status(400).json({
        message: 'Invalid type. Must be "plant", "livestock", or "all"'
      });
    }

    let plantResults = [];
    let livestockResults = [];

    // Using simple LIKE query for PostgreSQL (in a production app, consider using more advanced search)
    const searchTerm = `%${query}%`;

    if (type === 'plant' || type === 'all') {
      plantResults = await PlantDisease.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: searchTerm } },
            { description: { [Op.iLike]: searchTerm } }
          ]
        },
        order: [['name', 'ASC']]
      });
    }

    if (type === 'livestock' || type === 'all') {
      livestockResults = await LivestockDisease.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: searchTerm } },
            { description: { [Op.iLike]: searchTerm } }
          ]
        },
        order: [['name', 'ASC']]
      });
    }

    res.status(200).json({
      plantDiseases: plantResults,
      livestockDiseases: livestockResults,
      totalResults: plantResults.length + livestockResults.length
    });
  } catch (error) {
    console.error('Search diseases error:', error);
    res.status(500).json({
      message: 'Error searching diseases',
      error: error.message
    });
  }
};

// Get symptoms list by disease type
exports.getSymptomsList = async (req, res) => {
  try {
    const { type } = req.params;

    if (type !== 'plant' && type !== 'livestock') {
      return res.status(400).json({
        message: 'Invalid type. Must be "plant" or "livestock"'
      });
    }

    let allDiseases;
    if (type === 'plant') {
      allDiseases = await PlantDisease.findAll({
        attributes: ['symptoms']
      });
    } else {
      allDiseases = await LivestockDisease.findAll({
        attributes: ['symptoms']
      });
    }

    // Extract and deduplicate all symptoms
    const allSymptoms = allDiseases
      .flatMap(disease => disease.symptoms)
      .filter(Boolean);

    const uniqueSymptoms = [...new Set(allSymptoms)].sort();

    res.status(200).json({
      symptoms: uniqueSymptoms,
      count: uniqueSymptoms.length
    });
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({
      message: 'Error fetching symptoms',
      error: error.message
    });
  }
};
