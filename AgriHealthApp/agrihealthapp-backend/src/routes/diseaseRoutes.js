const express = require('express');
const diseaseController = require('../controllers/diseaseController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all diseases by type (plant or livestock)
router.get('/type/:type', diseaseController.getDiseasesByType);

// Get diseases filtered by species name
router.get('/species/:type/:species', diseaseController.getDiseasesBySpecies);

// Get specific disease by ID
router.get('/:type/:id', diseaseController.getDiseaseById);

// Search diseases by name or keyword
router.get('/search/:type/:query', diseaseController.searchDiseases);

// Get all symptoms for a disease type
router.get('/symptoms/:type', diseaseController.getSymptomsList);

module.exports = router;
