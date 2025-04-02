const express = require('express');
const diagnosisController = require('../controllers/diagnosisController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Submit a new diagnosis (with optional image upload)
router.post(
  '/',
  upload.single('image'),
  diagnosisController.submitDiagnosis
);

// Update a diagnosis with symptom selection
router.put(
  '/:id/symptoms',
  diagnosisController.updateDiagnosisWithSymptoms
);

// Get user's diagnosis history
router.get('/history', diagnosisController.getUserDiagnoses);

// Get specific diagnosis by ID
router.get('/:id', diagnosisController.getDiagnosisById);

module.exports = router;
