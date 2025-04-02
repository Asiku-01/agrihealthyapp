const { Diagnosis, PlantDisease, LivestockDisease } = require('../models');
const { uploadToS3 } = require('../middleware/upload');

// Submit new diagnosis request
exports.submitDiagnosis = async (req, res) => {
  try {
    const { type, speciesName, symptoms, temperature, notes, location } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!type || !speciesName || !symptoms) {
      return res.status(400).json({
        message: 'Missing required fields: type, speciesName, symptoms'
      });
    }

    // Validate diagnosis type
    if (type !== 'plant' && type !== 'livestock') {
      return res.status(400).json({
        message: 'Invalid diagnosis type. Must be "plant" or "livestock"'
      });
    }

    // Check if we have an image file
    let imageUrl = null;
    if (req.file) {
      try {
        // Upload image to S3
        imageUrl = await uploadToS3(req.file);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({
          message: 'Error uploading image',
          error: uploadError.message
        });
      }
    }

    // Create a new diagnosis record
    const diagnosis = await Diagnosis.create({
      userId,
      type,
      speciesName,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      temperature,
      imageUrl,
      notes,
      location,
      status: 'pending' // Initial status
    });

    // If we have an image, process the diagnosis (simulate ML processing)
    if (imageUrl) {
      // Perform disease identification based on type
      let possibleDisease;
      let confidence;

      if (type === 'plant') {
        // Simulate plant disease identification
        const plantDiseases = await PlantDisease.findAll({
          where: { plantType: speciesName }
        });

        if (plantDiseases.length > 0) {
          // Simple simulation - in real app would use ML model
          const randomIndex = Math.floor(Math.random() * plantDiseases.length);
          possibleDisease = plantDiseases[randomIndex];
          confidence = parseFloat((0.7 + Math.random() * 0.3).toFixed(2)); // 0.7-1.0
        }
      } else {
        // Simulate livestock disease identification
        const livestockDiseases = await LivestockDisease.findAll({
          where: { animalType: speciesName }
        });

        if (livestockDiseases.length > 0) {
          // Simple simulation - in real app would use ML model
          const randomIndex = Math.floor(Math.random() * livestockDiseases.length);
          possibleDisease = livestockDiseases[randomIndex];
          confidence = parseFloat((0.7 + Math.random() * 0.3).toFixed(2)); // 0.7-1.0
        }
      }

      // Update diagnosis with result if found
      if (possibleDisease) {
        await diagnosis.update({
          diagnosisResult: possibleDisease.name,
          confidence,
          status: 'completed'
        });
      }
    }

    // Re-fetch updated diagnosis
    const updatedDiagnosis = await Diagnosis.findByPk(diagnosis.id);

    res.status(201).json({
      message: 'Diagnosis submitted successfully',
      diagnosis: updatedDiagnosis
    });
  } catch (error) {
    console.error('Diagnosis submission error:', error);
    res.status(500).json({
      message: 'Error submitting diagnosis',
      error: error.message
    });
  }
};

// Get diagnosis by ID
exports.getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const diagnosis = await Diagnosis.findOne({
      where: { id, userId }
    });

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    // If diagnosis has a result, fetch detailed disease information
    let diseaseDetails = null;
    if (diagnosis.diagnosisResult) {
      if (diagnosis.type === 'plant') {
        diseaseDetails = await PlantDisease.findOne({
          where: { name: diagnosis.diagnosisResult }
        });
      } else {
        diseaseDetails = await LivestockDisease.findOne({
          where: { name: diagnosis.diagnosisResult }
        });
      }
    }

    res.status(200).json({
      diagnosis,
      diseaseDetails
    });
  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({
      message: 'Error fetching diagnosis',
      error: error.message
    });
  }
};

// Get all diagnoses for current user
exports.getUserDiagnoses = async (req, res) => {
  try {
    const userId = req.user.id;

    const diagnoses = await Diagnosis.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ diagnoses });
  } catch (error) {
    console.error('Get user diagnoses error:', error);
    res.status(500).json({
      message: 'Error fetching user diagnoses',
      error: error.message
    });
  }
};

// Update diagnosis with manual symptom selection
exports.updateDiagnosisWithSymptoms = async (req, res) => {
  try {
    const { id } = req.params;
    const { symptoms } = req.body;
    const userId = req.user.id;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        message: 'Symptoms array is required'
      });
    }

    // Find the diagnosis
    const diagnosis = await Diagnosis.findOne({
      where: { id, userId }
    });

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    // Update symptoms
    await diagnosis.update({
      symptoms,
      status: 'pending' // Reset status for re-evaluation
    });

    // Perform disease identification based on type and symptoms
    let possibleDisease;
    let confidence;

    if (diagnosis.type === 'plant') {
      // Find plant diseases that match the most symptoms
      const plantDiseases = await PlantDisease.findAll({
        where: { plantType: diagnosis.speciesName }
      });

      if (plantDiseases.length > 0) {
        // Find disease with most matching symptoms
        possibleDisease = plantDiseases.reduce((best, current) => {
          const matchingSymptoms = symptoms.filter(symptom =>
            current.symptoms.includes(symptom)
          );

          if (!best || matchingSymptoms.length > best.matchCount) {
            return { disease: current, matchCount: matchingSymptoms.length };
          }
          return best;
        }, null)?.disease;

        if (possibleDisease) {
          confidence = parseFloat((0.6 + Math.random() * 0.4).toFixed(2)); // 0.6-1.0
        }
      }
    } else {
      // Find livestock diseases that match symptoms
      const livestockDiseases = await LivestockDisease.findAll({
        where: { animalType: diagnosis.speciesName }
      });

      if (livestockDiseases.length > 0) {
        // Find disease with most matching symptoms
        possibleDisease = livestockDiseases.reduce((best, current) => {
          const matchingSymptoms = symptoms.filter(symptom =>
            current.symptoms.includes(symptom)
          );

          if (!best || matchingSymptoms.length > best.matchCount) {
            return { disease: current, matchCount: matchingSymptoms.length };
          }
          return best;
        }, null)?.disease;

        if (possibleDisease) {
          confidence = parseFloat((0.6 + Math.random() * 0.4).toFixed(2)); // 0.6-1.0
        }
      }
    }

    // Update diagnosis with result if found
    if (possibleDisease) {
      await diagnosis.update({
        diagnosisResult: possibleDisease.name,
        confidence,
        status: 'completed'
      });
    } else {
      // If no definitive match, send for expert review
      await diagnosis.update({
        status: 'expert_review'
      });
    }

    // Re-fetch updated diagnosis
    const updatedDiagnosis = await Diagnosis.findByPk(diagnosis.id);

    // Get disease details if available
    let diseaseDetails = null;
    if (updatedDiagnosis.diagnosisResult) {
      if (updatedDiagnosis.type === 'plant') {
        diseaseDetails = await PlantDisease.findOne({
          where: { name: updatedDiagnosis.diagnosisResult }
        });
      } else {
        diseaseDetails = await LivestockDisease.findOne({
          where: { name: updatedDiagnosis.diagnosisResult }
        });
      }
    }

    res.status(200).json({
      message: 'Diagnosis updated successfully',
      diagnosis: updatedDiagnosis,
      diseaseDetails
    });
  } catch (error) {
    console.error('Update diagnosis error:', error);
    res.status(500).json({
      message: 'Error updating diagnosis',
      error: error.message
    });
  }
};
