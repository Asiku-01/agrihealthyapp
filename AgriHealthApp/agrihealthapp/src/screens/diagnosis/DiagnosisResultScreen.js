import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Platform,
  Linking
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  List,
  Chip,
  Avatar,
  ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

const DiagnosisResultScreen = ({ route, navigation }) => {
  const { diagnosis, diseaseDetails, aiResults } = route.params || {};
  const [showAiDetails, setShowAiDetails] = useState(false);

  if (!diagnosis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color={theme.colors.error}
          />
          <Text style={styles.errorText}>Diagnosis information not found</Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(diagnosis.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShareResult = async () => {
    try {
      const diagnosisText = `
        AgriHealth App Diagnosis Results:
        Date: ${formattedDate}
        Type: ${diagnosis.type === 'plant' ? 'Plant' : 'Livestock'} (${diagnosis.speciesName})
        Diagnosis: ${diagnosis.diagnosisResult}
        Confidence: ${Math.round(diagnosis.confidence * 100)}%

        ${diseaseDetails?.description || ''}

        Treatment recommendations:
        ${diseaseDetails?.treatmentMethods?.join('\n• ') || 'N/A'}
      `;

      await Share.share({
        message: diagnosisText,
        title: 'AgriHealth Diagnosis Results',
      });
    } catch (error) {
      console.error('Error sharing diagnosis:', error);
    }
  };

  const handleExportPDF = () => {
    // PDF export functionality would be implemented here
    // For now, we'll show an alert
    alert('PDF export functionality will be available in the next update!');
  };

  const handleLearnMore = () => {
    if (diagnosis.type === 'plant' && diseaseDetails) {
      // In a real app, this would open a web page with more information
      const searchTerm = encodeURIComponent(`${diseaseDetails.name} plant disease treatment`);
      const url = `https://www.google.com/search?q=${searchTerm}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        }
      });
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return theme.colors.success;
    if (confidence > 0.6) return theme.colors.warning;
    return theme.colors.error;
  };

  const confidenceColor = getConfidenceColor(diagnosis.confidence);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Title style={styles.headerTitle}>Diagnosis Results</Title>
              <Paragraph style={styles.date}>{formattedDate}</Paragraph>
            </View>
            <View style={styles.headerIconContainer}>
              {diagnosis.type === 'plant' ? (
                <MaterialCommunityIcons name="leaf" size={30} color={theme.colors.primary} />
              ) : (
                <MaterialCommunityIcons name="cow" size={30} color={theme.colors.primary} />
              )}
            </View>
          </Card.Content>
        </Card>

        {/* AI Analysis Badge - visible when AI was used */}
        {aiResults && (
          <TouchableOpacity onPress={() => setShowAiDetails(!showAiDetails)}>
            <Card style={[styles.aiCard, { borderColor: theme.colors.primary }]}>
              <Card.Content style={styles.aiCardContent}>
                <View style={styles.aiBadge}>
                  <MaterialCommunityIcons name="robot" size={24} color={theme.colors.primary} />
                  <Text style={styles.aiBadgeText}>AI-Assisted Diagnosis</Text>
                </View>
                <MaterialCommunityIcons
                  name={showAiDetails ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={theme.colors.primary}
                />
              </Card.Content>

              {showAiDetails && (
                <View style={styles.aiDetailsContainer}>
                  <Divider style={styles.divider} />
                  <Card.Content>
                    <Text style={styles.aiDetailTitle}>AI Analysis Details</Text>

                    {aiResults.diseases && aiResults.diseases.length > 0 ? (
                      aiResults.diseases.map((disease, index) => (
                        <View key={index} style={styles.aiDiseaseItem}>
                          <View style={styles.aiDiseaseHeader}>
                            <Text style={styles.aiDiseaseName}>{disease.name}</Text>
                            <ProgressBar
                              progress={disease.probability}
                              color={getConfidenceColor(disease.probability)}
                              style={styles.confidenceBar}
                            />
                            <Text style={styles.probabilityText}>
                              {Math.round(disease.probability * 100)}% confidence
                            </Text>
                          </View>

                          {disease.description && (
                            <Text style={styles.aiDiseaseDescription}>
                              {disease.description}
                            </Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.aiNoDisease}>No specific diseases detected</Text>
                    )}

                    <Text style={styles.aiSuggestion}>{aiResults.suggestions}</Text>
                  </Card.Content>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}

        {/* Diagnosis Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Diagnosis Information</Title>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>
                {diagnosis.type === 'plant' ? 'Plant' : 'Livestock'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Species:</Text>
              <Text style={styles.infoValue}>{diagnosis.speciesName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Result:</Text>
              <Text style={[styles.infoValue, styles.resultText]}>
                {diagnosis.diagnosisResult || 'Pending'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Confidence:</Text>
              <View style={styles.confidenceContainer}>
                <ProgressBar
                  progress={diagnosis.confidence}
                  color={confidenceColor}
                  style={styles.confidenceBar}
                />
                <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                  {Math.round(diagnosis.confidence * 100)}%
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.symptomsTitle}>Symptoms</Text>
            <View style={styles.symptomsContainer}>
              {diagnosis.symptoms && diagnosis.symptoms.length > 0 ? (
                diagnosis.symptoms.map((symptom, index) => (
                  <Chip key={index} style={styles.symptomChip} mode="outlined">
                    {symptom}
                  </Chip>
                ))
              ) : (
                <Text style={styles.noDataText}>No symptoms recorded</Text>
              )}
            </View>

            {diagnosis.notes && (
              <>
                <Text style={styles.notesTitle}>Notes</Text>
                <Paragraph style={styles.notes}>{diagnosis.notes}</Paragraph>
              </>
            )}

            {diagnosis.imageUrl && (
              <>
                <Text style={styles.imageTitle}>Image</Text>
                <Image
                  source={{ uri: diagnosis.imageUrl }}
                  style={styles.diagnosisImage}
                  resizeMode="cover"
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Disease Information */}
        {diseaseDetails && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Disease Information</Title>
              <Divider style={styles.divider} />

              <Text style={styles.diseaseTitle}>{diseaseDetails.name}</Text>
              <Paragraph style={styles.diseaseDescription}>
                {diseaseDetails.description}
              </Paragraph>

              <Text style={styles.sectionTitle}>Possible Causes</Text>
              <Paragraph style={styles.sectionText}>{diseaseDetails.causes}</Paragraph>

              <Text style={styles.sectionTitle}>Treatment Methods</Text>
              {diseaseDetails.treatmentMethods && diseaseDetails.treatmentMethods.length > 0 ? (
                <View style={styles.methodsList}>
                  {diseaseDetails.treatmentMethods.map((method, index) => (
                    <View key={index} style={styles.methodItem}>
                      <MaterialCommunityIcons name="check" size={18} color={theme.colors.primary} />
                      <Text style={styles.methodText}>{method}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No treatment methods available</Text>
              )}

              <Text style={styles.sectionTitle}>Prevention</Text>
              {diseaseDetails.preventionMethods && diseaseDetails.preventionMethods.length > 0 ? (
                <View style={styles.methodsList}>
                  {diseaseDetails.preventionMethods.map((method, index) => (
                    <View key={index} style={styles.methodItem}>
                      <MaterialCommunityIcons
                        name="shield-check"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.methodText}>{method}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No prevention methods available</Text>
              )}

              <Button
                mode="outlined"
                icon="web"
                onPress={handleLearnMore}
                style={styles.learnMoreButton}
              >
                Learn More
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            icon="share-variant"
            onPress={handleShareResult}
            style={styles.actionButton}
          >
            Share
          </Button>
          <Button
            mode="outlined"
            icon="file-pdf-box"
            onPress={handleExportPDF}
            style={styles.actionButton}
          >
            Export PDF
          </Button>
        </View>

        <Button
          mode="text"
          icon="history"
          onPress={() => navigation.navigate('DiagnosisHistory')}
          style={styles.historyButton}
        >
          View Diagnosis History
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginVertical: 16,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 20,
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  date: {
    color: theme.colors.gray,
    marginTop: 4,
  },
  headerIconContainer: {
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    borderRadius: 50,
  },
  card: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: theme.colors.primary,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: theme.colors.lightGray,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: theme.colors.gray,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
  },
  resultText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  confidenceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  confidenceText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  symptomsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  symptomChip: {
    margin: 4,
  },
  notesTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  notes: {
    backgroundColor: theme.colors.lightBackground,
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
  imageTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  diagnosisImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  diseaseDescription: {
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    marginBottom: 12,
  },
  methodsList: {
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  methodText: {
    marginLeft: 8,
    flex: 1,
  },
  noDataText: {
    fontStyle: 'italic',
    color: theme.colors.gray,
    marginBottom: 16,
  },
  learnMoreButton: {
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  historyButton: {
    marginTop: 8,
  },
  aiCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  aiCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadgeText: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 16,
    color: theme.colors.primary,
  },
  aiDetailsContainer: {
    marginTop: 8,
  },
  aiDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aiDiseaseItem: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: theme.colors.lightBackground,
    borderRadius: 8,
  },
  aiDiseaseHeader: {
    marginBottom: 8,
  },
  aiDiseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  probabilityText: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 2,
  },
  aiDiseaseDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiNoDisease: {
    fontStyle: 'italic',
    color: theme.colors.gray,
    marginBottom: 10,
  },
  aiSuggestion: {
    marginTop: 10,
    fontWeight: '500',
    fontSize: 15,
    color: theme.colors.primary,
  },
});

export default DiagnosisResultScreen;
