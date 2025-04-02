import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  RadioButton,
  TextInput,
  Chip,
  Divider,
  Portal,
  Dialog,
  List,
  ActivityIndicator,
  Switch
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { theme } from '../../config/theme';
import PlantDiseaseDetectionService from '../../services/PlantDiseaseDetectionService';

// Plant and animal types
const plantTypes = [
  'Tomato', 'Potato', 'Corn', 'Rice', 'Wheat',
  'Apple', 'Mango', 'Cucumber', 'Pepper', 'Other'
];

const animalTypes = [
  'Cattle', 'Sheep', 'Goat', 'Poultry', 'Pig',
  'Horse', 'Rabbit', 'Fish', 'Other'
];

// Common symptoms for plants
const plantSymptoms = [
  'Leaf spots', 'Yellowing leaves', 'Wilting', 'Stunted growth',
  'Leaf curl', 'Powdery coating', 'Rotting', 'Mold', 'Black spots',
  'Brown edges', 'Holes in leaves', 'Blisters', 'White spots'
];

// Common symptoms for livestock
const animalSymptoms = [
  'Fever', 'Loss of appetite', 'Lameness', 'Coughing',
  'Diarrhea', 'Weight loss', 'Skin lesions', 'Lethargy',
  'Nasal discharge', 'Difficulty breathing', 'Abnormal behavior'
];

const DiagnosisScreen = ({ navigation }) => {
  const [diagnosisType, setDiagnosisType] = useState('plant');
  const [speciesName, setSpeciesName] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [image, setImage] = useState(null);
  const [imageSource, setImageSource] = useState(null);
  const [notes, setNotes] = useState('');
  const [temperature, setTemperature] = useState('');
  const [useAIDetection, setUseAIDetection] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(false);

  const [showSpeciesDialog, setShowSpeciesDialog] = useState(false);
  const [showSymptomsDialog, setShowSymptomsDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentSymptomsList = diagnosisType === 'plant' ? plantSymptoms : animalSymptoms;
  const currentSpeciesList = diagnosisType === 'plant' ? plantTypes : animalTypes;

  // Reset state when diagnosis type changes
  useEffect(() => {
    setSpeciesName('');
    setCustomSpecies('');
    setSymptoms([]);
    setImage(null);
    setImageSource(null);
    setNotes('');
    setAiResults(null);

    // Disable AI for livestock
    if (diagnosisType === 'livestock') {
      setUseAIDetection(false);
    }
  }, [diagnosisType]);

  const handleSpeciesSelect = (species) => {
    if (species === 'Other') {
      setSpeciesName('Other');
    } else {
      setSpeciesName(species);
      setCustomSpecies('');
    }
    setShowSpeciesDialog(false);
  };

  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const takePicture = async () => {
    try {
      navigation.navigate('Camera', {
        onPictureTaken: (photoUri, aiMode) => {
          setImage({
            uri: photoUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
          });
          setImageSource({ uri: photoUri });

          // If AI mode is active, process the image for disease detection
          if (aiMode && diagnosisType === 'plant') {
            processImageWithAI(photoUri);
          }
        },
        aiMode: useAIDetection && diagnosisType === 'plant'
      });
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage({
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'photo.jpg',
        });
        setImageSource({ uri: selectedImage.uri });

        // If AI detection is enabled, process the selected image
        if (useAIDetection && diagnosisType === 'plant') {
          processImageWithAI(selectedImage.uri);
        }
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const processImageWithAI = async (imageUri) => {
    if (!imageUri) return;

    setAiProcessing(true);
    setAiResults(null);

    try {
      // For development, use mock detection to avoid API costs
      const results = await PlantDiseaseDetectionService.getMockDetectionResult(speciesName);

      // In production, uncomment this to use real API
      // const results = await PlantDiseaseDetectionService.identifyDisease(imageUri);

      setAiResults(results);

      // Auto-populate the form with AI-detected information
      if (results && !results.isHealthy && results.diseases.length > 0) {
        const detectedDisease = results.diseases[0];

        // Add detected symptoms
        if (detectedDisease.name) {
          const aiSymptoms = getAISymptoms(detectedDisease.name);
          setSymptoms(aiSymptoms);
        }

        // Add notes with AI suggestions
        setNotes(results.suggestions || '');
      }
    } catch (error) {
      console.error('AI detection error:', error);
      Alert.alert('AI Detection Error', 'Failed to analyze the image. Please try again or fill the form manually.');
    } finally {
      setAiProcessing(false);
    }
  };

  // Map AI disease names to symptoms in our system
  const getAISymptoms = (diseaseName) => {
    const diseaseToSymptoms = {
      'Late Blight': ['Leaf spots', 'Rotting', 'Black spots', 'Wilting'],
      'Early Blight': ['Leaf spots', 'Brown edges', 'Yellowing leaves'],
      'Powdery Mildew': ['Powdery coating', 'White spots', 'Leaf curl'],
      'Corn Rust': ['Leaf spots', 'Brown edges', 'Yellowing leaves'],
      'Apple Scab': ['Leaf spots', 'Black spots', 'Rotting'],
      'Leaf Spot': ['Leaf spots', 'Brown edges', 'Black spots']
    };

    return diseaseToSymptoms[diseaseName] || ['Leaf spots', 'Yellowing leaves'];
  };

  const submitDiagnosis = async () => {
    // Validation
    if (!speciesName) {
      Alert.alert('Missing Information', 'Please select a plant or animal type');
      return;
    }

    if (speciesName === 'Other' && !customSpecies) {
      Alert.alert('Missing Information', 'Please enter the species name');
      return;
    }

    if (symptoms.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one symptom');
      return;
    }

    setLoading(true);

    try {
      // Create form data for image upload
      const formData = new FormData();

      // Add diagnosis data
      formData.append('type', diagnosisType);
      formData.append('speciesName', speciesName === 'Other' ? customSpecies : speciesName);
      symptoms.forEach(symptom => {
        formData.append('symptoms[]', symptom);
      });

      if (temperature) {
        formData.append('temperature', parseFloat(temperature));
      }

      if (notes) {
        formData.append('notes', notes);
      }

      // Add AI results if available
      if (useAIDetection && aiResults) {
        formData.append('aiDetection', JSON.stringify(aiResults));
      }

      // Add image if available
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(`${API_URL}/diagnosis`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.diagnosis) {
        navigation.navigate('DiagnosisResult', {
          diagnosis: response.data.diagnosis,
          diseaseDetails: response.data.diseaseDetails || null,
          aiResults: aiResults
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Diagnosis submission error:', error);
      Alert.alert(
        'Submission Error',
        'Unable to submit diagnosis. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, navigate directly to results
  const handleDemoSubmit = () => {
    // In a real app, we would submit to the API

    // Create a sample diagnosis result with AI detection if enabled
    const mockDiagnosis = {
      id: 'demo-id',
      type: diagnosisType,
      speciesName: speciesName === 'Other' ? customSpecies : speciesName,
      symptoms,
      imageUrl: imageSource?.uri || null,
      temperature: temperature ? parseFloat(temperature) : null,
      notes,
      createdAt: new Date().toISOString(),
      diagnosisResult: diagnosisType === 'plant'
        ? (aiResults?.diseases?.[0]?.name || 'Late Blight')
        : 'Mastitis',
      confidence: aiResults?.diseases?.[0]?.probability || 0.85,
      status: 'completed'
    };

    // Mock disease details - use AI results if available
    const mockDiseaseDetails = {
      name: diagnosisType === 'plant'
        ? (aiResults?.diseases?.[0]?.name || 'Late Blight')
        : 'Mastitis',
      description: aiResults?.diseases?.[0]?.description || (diagnosisType === 'plant'
        ? 'Late blight is a serious disease of potato and tomato plants caused by the fungus-like organism Phytophthora infestans.'
        : 'Mastitis is an inflammatory reaction of the udder tissue to bacterial, chemical, thermal or mechanical injury.'),
      symptoms: diagnosisType === 'plant'
        ? ['Dark brown spots on leaves', 'White fungal growth', 'Brown lesions on stems']
        : ['Swollen udder', 'Pain and discomfort', 'Abnormal milk', 'Reduced milk production'],
      causes: diagnosisType === 'plant'
        ? 'Caused by the pathogen Phytophthora infestans which thrives in cool, wet conditions.'
        : 'Commonly caused by bacterial infections. Poor milking hygiene and injured teats increase risk.',
      preventionMethods: aiResults?.diseases?.[0]?.prevention?.split(', ') || (diagnosisType === 'plant'
        ? ['Use resistant varieties', 'Provide good air circulation', 'Avoid overhead irrigation']
        : ['Good milking hygiene', 'Proper milking technique', 'Clean housing']),
      treatmentMethods: aiResults?.diseases?.[0]?.treatment?.split(', ') || (diagnosisType === 'plant'
        ? ['Apply fungicides preventatively', 'Remove and destroy infected plants']
        : ['Antibiotics', 'Anti-inflammatory drugs', 'Frequent milking of affected quarters'])
    };

    navigation.navigate('DiagnosisResult', {
      diagnosis: mockDiagnosis,
      diseaseDetails: mockDiseaseDetails,
      aiResults: aiResults
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Diagnosis Type */}
        <Title style={styles.sectionTitle}>Select diagnosis type</Title>
        <Card style={styles.card}>
          <Card.Content style={styles.radioButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                diagnosisType === 'plant' && styles.typeButtonSelected
              ]}
              onPress={() => setDiagnosisType('plant')}
            >
              <MaterialCommunityIcons
                name="leaf"
                size={24}
                color={diagnosisType === 'plant' ? theme.colors.primary : theme.colors.gray}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  diagnosisType === 'plant' && styles.typeButtonTextSelected
                ]}
              >
                Plant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                diagnosisType === 'livestock' && styles.typeButtonSelected
              ]}
              onPress={() => setDiagnosisType('livestock')}
            >
              <MaterialCommunityIcons
                name="cow"
                size={24}
                color={diagnosisType === 'livestock' ? theme.colors.primary : theme.colors.gray}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  diagnosisType === 'livestock' && styles.typeButtonTextSelected
                ]}
              >
                Livestock
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* AI Detection Switch (only for plants) */}
        {diagnosisType === 'plant' && (
          <Card style={styles.card}>
            <Card.Content style={styles.aiDetectionContainer}>
              <View style={styles.aiSwitchRow}>
                <MaterialCommunityIcons
                  name="robot"
                  size={24}
                  color={useAIDetection ? theme.colors.primary : theme.colors.gray}
                />
                <Text style={styles.aiSwitchText}>AI Plant Disease Detection</Text>
                <Switch
                  value={useAIDetection}
                  onValueChange={setUseAIDetection}
                  color={theme.colors.primary}
                />
              </View>
              {useAIDetection && (
                <Text style={styles.aiDescription}>
                  Take or upload a photo of the plant to automatically detect diseases using AI technology.
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Image Upload */}
        <Title style={styles.sectionTitle}>Upload an image</Title>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.imageInstructions}>
              Take a clear photo of the affected {diagnosisType === 'plant' ? 'plant' : 'animal'} for better diagnosis
            </Text>

            <View style={styles.imageButtons}>
              <Button
                mode="contained"
                icon="camera"
                onPress={takePicture}
                style={styles.imageButton}
                disabled={loading || aiProcessing}
              >
                Take Photo
              </Button>
              <Button
                mode="outlined"
                icon="image"
                onPress={pickImage}
                style={styles.imageButton}
                disabled={loading || aiProcessing}
              >
                Upload
              </Button>
            </View>

            {imageSource && (
              <View style={styles.imagePreviewContainer}>
                <Image source={imageSource} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setImage(null);
                    setImageSource(null);
                    setAiResults(null);
                  }}
                >
                  <MaterialCommunityIcons name="close-circle" size={28} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {aiProcessing && (
              <View style={styles.aiProcessingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.aiProcessingText}>Analyzing image with AI...</Text>
              </View>
            )}

            {/* Display AI Results */}
            {aiResults && !aiProcessing && (
              <View style={styles.aiResultsContainer}>
                <Title style={styles.aiResultsTitle}>
                  AI Analysis Results
                </Title>

                {aiResults.isHealthy ? (
                  <View style={styles.healthyResult}>
                    <MaterialCommunityIcons name="check-circle" size={28} color="green" />
                    <Text style={styles.healthyText}>Plant appears healthy</Text>
                  </View>
                ) : (
                  <View>
                    {aiResults.diseases.map((disease, index) => (
                      <View key={index} style={styles.diseaseResult}>
                        <Text style={styles.diseaseName}>{disease.name}</Text>
                        <Text style={styles.diseaseConfidence}>
                          Confidence: {Math.round(disease.probability * 100)}%
                        </Text>
                        <Text style={styles.diseaseDescription}>{disease.description}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Species Selection */}
        <Title style={styles.sectionTitle}>
          {diagnosisType === 'plant' ? 'Plant type' : 'Animal type'}
        </Title>
        <Card style={styles.card}>
          <Card.Content>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowSpeciesDialog(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {speciesName
                  ? speciesName
                  : `Select ${diagnosisType === 'plant' ? 'plant' : 'animal'} type`}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.gray} />
            </TouchableOpacity>

            {speciesName === 'Other' && (
              <TextInput
                label="Enter species name"
                value={customSpecies}
                onChangeText={setCustomSpecies}
                style={styles.textInput}
                mode="outlined"
              />
            )}
          </Card.Content>
        </Card>

        {/* Symptoms Selection */}
        <Title style={styles.sectionTitle}>Symptoms</Title>
        <Card style={styles.card}>
          <Card.Content>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowSymptomsDialog(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {symptoms.length > 0
                  ? `${symptoms.length} symptom${symptoms.length > 1 ? 's' : ''} selected`
                  : 'Select symptoms'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.gray} />
            </TouchableOpacity>

            {symptoms.length > 0 && (
              <View style={styles.selectedSymptomsContainer}>
                {symptoms.map(symptom => (
                  <Chip
                    key={symptom}
                    style={styles.symptomChip}
                    onClose={() => toggleSymptom(symptom)}
                    mode="outlined"
                  >
                    {symptom}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Title style={styles.sectionTitle}>Additional Information</Title>
        <Card style={styles.card}>
          <Card.Content>
            {diagnosisType === 'livestock' && (
              <TextInput
                label="Temperature (°C)"
                value={temperature}
                onChangeText={setTemperature}
                style={styles.textInput}
                keyboardType="numeric"
                mode="outlined"
              />
            )}

            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              style={styles.textInput}
              multiline
              numberOfLines={4}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          loading={loading}
          disabled={loading || aiProcessing}
          style={styles.submitButton}
          onPress={handleDemoSubmit} // Using demo mode for development
          // onPress={submitDiagnosis} // Use this in production
        >
          Submit Diagnosis
        </Button>
      </ScrollView>

      {/* Species Selection Dialog */}
      <Portal>
        <Dialog
          visible={showSpeciesDialog}
          onDismiss={() => setShowSpeciesDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>
            {diagnosisType === 'plant' ? 'Select Plant Type' : 'Select Animal Type'}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {currentSpeciesList.map(species => (
                <List.Item
                  key={species}
                  title={species}
                  onPress={() => handleSpeciesSelect(species)}
                  right={props =>
                    speciesName === species && (
                      <MaterialCommunityIcons name="check" size={24} color={theme.colors.primary} />
                    )
                  }
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowSpeciesDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Symptoms Selection Dialog */}
      <Portal>
        <Dialog
          visible={showSymptomsDialog}
          onDismiss={() => setShowSymptomsDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Select Symptoms</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {currentSymptomsList.map(symptom => (
                <List.Item
                  key={symptom}
                  title={symptom}
                  onPress={() => toggleSymptom(symptom)}
                  right={props =>
                    symptoms.includes(symptom) && (
                      <MaterialCommunityIcons name="check" size={24} color={theme.colors.primary} />
                    )
                  }
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowSymptomsDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.primary,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  radioButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    width: '45%',
    justifyContent: 'center',
  },
  typeButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.gray,
  },
  typeButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  textInput: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  selectedSymptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  symptomChip: {
    margin: 4,
  },
  imageInstructions: {
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.gray,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  imageButton: {
    width: '45%',
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogScrollArea: {
    maxHeight: 400,
  },
  aiDetectionContainer: {
    padding: 5,
  },
  aiSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiSwitchText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  aiDescription: {
    marginTop: 10,
    color: theme.colors.gray,
    fontSize: 14,
  },
  aiProcessingContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  aiProcessingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.primary,
  },
  aiResultsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  aiResultsTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 10,
  },
  healthyResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  healthyText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'green',
    fontWeight: '500',
  },
  diseaseResult: {
    marginVertical: 10,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
  },
  diseaseConfidence: {
    fontSize: 14,
    color: theme.colors.gray,
    marginVertical: 5,
  },
  diseaseDescription: {
    fontSize: 14,
    color: theme.colors.text,
  },
});

export default DiagnosisScreen;
