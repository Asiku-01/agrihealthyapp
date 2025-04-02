import axios from 'axios';
import { PLANT_ID_API_URL, PLANT_ID_API_KEY } from '../config/api';
import * as FileSystem from 'expo-file-system';

/**
 * Service for handling plant disease detection using Plant.id API
 */
class PlantDiseaseDetectionService {
  /**
   * Identify plant disease from an image
   * @param {string} imageUri - URI of the image to analyze
   * @returns {Promise<Object>} - Detection results
   */
  async identifyDisease(imageUri) {
    try {
      // Convert image to base64
      const base64Image = await this.imageToBase64(imageUri);

      // Prepare data for Plant.id API
      const data = {
        api_key: PLANT_ID_API_KEY,
        images: [base64Image],
        modifiers: ["crops_fast", "similar_images"],
        disease_details: ["cause", "common_names", "classification", "description", "treatment", "prevention"],
      };

      // Call Plant.id API
      const response = await axios.post(`${PLANT_ID_API_URL}/health_assessment`, data);
      return this.processDiseaseResponse(response.data);
    } catch (error) {
      console.error('Error identifying plant disease:', error);
      throw new Error('Failed to identify plant disease');
    }
  }

  /**
   * Convert image URI to base64 string
   * @param {string} uri - Image URI
   * @returns {Promise<string>} - Base64 encoded image
   */
  async imageToBase64(uri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Process and format the response from Plant.id API
   * @param {Object} response - API response
   * @returns {Object} - Formatted disease information
   */
  processDiseaseResponse(response) {
    // If no disease detected or health assessment failed
    if (!response.health_assessment || !response.health_assessment.diseases || response.health_assessment.diseases.length === 0) {
      return {
        isHealthy: true,
        diseases: [],
        suggestions: 'The plant appears to be healthy. Continue monitoring for any changes.'
      };
    }

    // Sort diseases by probability
    const diseases = response.health_assessment.diseases
      .sort((a, b) => b.probability - a.probability)
      .map(disease => ({
        name: disease.name,
        probability: disease.probability,
        description: disease.description,
        treatment: disease.treatment && disease.treatment.chemical && disease.treatment.chemical.join(', '),
        prevention: disease.prevention && disease.prevention.join(', '),
        similar_images: disease.similar_images || []
      }));

    // Determine if plant is healthy based on disease probabilities
    const isHealthy = diseases.length === 0 || diseases[0].probability < 0.15;

    // Return formatted result
    return {
      isHealthy,
      diseases,
      suggestions: isHealthy
        ? 'The plant appears to be healthy. Continue monitoring for any changes.'
        : `Possible ${diseases[0].name} detected. Follow treatment recommendations.`
    };
  }

  /**
   * Mock detection for development/demo purposes
   * @param {string} plantType - Type of plant
   * @returns {Object} - Mock detection results
   */
  getMockDetectionResult(plantType) {
    const mockDiseases = {
      'Tomato': {
        name: 'Late Blight',
        probability: 0.87,
        description: 'Late blight is an economically devastating disease of tomato and potato caused by the fungus-like organism Phytophthora infestans.',
        treatment: 'Apply copper-based fungicides, chlorothalonil, or mancozeb according to label instructions',
        prevention: 'Plant resistant varieties, ensure good air circulation, avoid overhead irrigation'
      },
      'Potato': {
        name: 'Early Blight',
        probability: 0.92,
        description: 'Early blight is a common fungal disease of potato and tomato plants caused by Alternaria solani.',
        treatment: 'Apply fungicides containing chlorothalonil, copper, or mancozeb',
        prevention: 'Practice crop rotation, remove infected plant debris, maintain adequate plant nutrition'
      },
      'Corn': {
        name: 'Corn Rust',
        probability: 0.85,
        description: 'Corn rust is a fungal disease caused by Puccinia sorghi that produces reddish-brown pustules on corn leaves.',
        treatment: 'Apply foliar fungicides like azoxystrobin, propiconazole, or pyraclostrobin',
        prevention: 'Plant resistant hybrids, practice crop rotation, provide adequate plant spacing'
      },
      'Apple': {
        name: 'Apple Scab',
        probability: 0.89,
        description: 'Apple scab is a serious disease of apple trees caused by the fungus Venturia inaequalis.',
        treatment: 'Apply fungicides like captan, myclobutanil, or thiophanate-methyl',
        prevention: 'Prune trees for good air circulation, remove fallen leaves, plant resistant varieties'
      }
    };

    // Get mock disease for the plant type or use a default
    const diseaseData = mockDiseases[plantType] || {
      name: 'Leaf Spot',
      probability: 0.78,
      description: 'Leaf spot is a common plant disease characterized by spots or lesions on the leaves.',
      treatment: 'Apply appropriate fungicides based on the specific pathogen',
      prevention: 'Ensure good air circulation, avoid overhead watering, remove infected leaves'
    };

    return {
      isHealthy: false,
      diseases: [diseaseData],
      suggestions: `Likely ${diseaseData.name} detected. ${diseaseData.treatment}.`
    };
  }
}

export default new PlantDiseaseDetectionService();
