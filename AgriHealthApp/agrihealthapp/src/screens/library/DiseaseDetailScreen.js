import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Share
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  List,
  Button,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

const DiseaseDetailScreen = ({ route, navigation }) => {
  const { disease, type = 'plant' } = route.params || {};

  if (!disease) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color={theme.colors.error} />
        <Text style={styles.errorText}>Disease information not available</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.gray;
    }
  };

  const handleShare = async () => {
    try {
      const speciesType = type === 'plant' ? 'Plant' : 'Animal';
      const speciesField = type === 'plant' ? 'Plant Type' : 'Animal Type';
      const speciesValue = type === 'plant' ? disease.plantType : disease.animalType;

      await Share.share({
        title: `${disease.name} - Disease Information`,
        message:
`${disease.name}
${speciesField}: ${speciesValue}
Severity: ${disease.severity}

${disease.description}

Symptoms:
${disease.symptoms.join('\n')}

Prevention:
${disease.preventionMethods ? disease.preventionMethods.join('\n') : 'Not available'}

Treatment:
${disease.treatmentMethods ? disease.treatmentMethods.join('\n') : 'Not available'}

Shared from AgriHealthApp`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Title style={styles.title}>{disease.name}</Title>
                <View style={styles.typeRow}>
                  <Chip
                    style={[
                      styles.typeChip,
                      { backgroundColor: type === 'plant' ? theme.colors.lightGreen : theme.colors.lightBlue }
                    ]}
                  >
                    {type === 'plant' ? disease.plantType : disease.animalType}
                  </Chip>
                  <Chip
                    style={[
                      styles.severityChip,
                      { backgroundColor: getSeverityColor(disease.severity) + '20' } // 20 for opacity
                    ]}
                    textStyle={{ color: getSeverityColor(disease.severity) }}
                  >
                    {disease.severity.charAt(0).toUpperCase() + disease.severity.slice(1)} Severity
                  </Chip>
                </View>
              </View>
              <IconButton
                icon="share-variant"
                size={24}
                onPress={handleShare}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Disease Image */}
        {disease.imageUrl && (
          <Card style={styles.imageCard}>
            <Card.Content style={styles.imageContainer}>
              <Image
                source={{ uri: disease.imageUrl }}
                style={styles.diseaseImage}
                resizeMode="cover"
              />
            </Card.Content>
          </Card>
        )}

        {/* Description */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Description</Title>
            <Paragraph style={styles.description}>{disease.description}</Paragraph>
          </Card.Content>
        </Card>

        {/* Symptoms */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Symptoms</Title>
            <View style={styles.bulletList}>
              {disease.symptoms.map((symptom, index) => (
                <View key={index} style={styles.bulletItem}>
                  <MaterialCommunityIcons
                    name="circle-medium"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.bulletIcon}
                  />
                  <Text style={styles.bulletText}>{symptom}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Causes */}
        {disease.causes && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Causes</Title>
              <Paragraph style={styles.description}>{disease.causes}</Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Prevention */}
        {disease.preventionMethods && disease.preventionMethods.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Prevention</Title>
              <View style={styles.bulletList}>
                {disease.preventionMethods.map((method, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={20}
                      color={theme.colors.success}
                      style={styles.bulletIcon}
                    />
                    <Text style={styles.bulletText}>{method}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Treatment */}
        {disease.treatmentMethods && disease.treatmentMethods.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Treatment</Title>
              <View style={styles.bulletList}>
                {disease.treatmentMethods.map((method, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <MaterialCommunityIcons
                      name="medical-bag"
                      size={20}
                      color={theme.colors.error}
                      style={styles.bulletIcon}
                    />
                    <Text style={styles.bulletText}>{method}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Environmental Factors */}
        {(disease.optimalTemperature || disease.temperatureFactors) && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Environmental Factors</Title>

              {disease.optimalTemperature && (
                <View style={styles.envFactorRow}>
                  <MaterialCommunityIcons
                    name="thermometer"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.envFactorText}>
                    Optimal Temperature: {disease.optimalTemperature}
                  </Text>
                </View>
              )}

              {disease.temperatureFactors && (
                <Paragraph style={styles.description}>
                  {disease.temperatureFactors}
                </Paragraph>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Zoonotic Warning for Livestock Diseases */}
        {type === 'livestock' && disease.zoonotic && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.lightRed }]}>
            <Card.Content>
              <View style={styles.warningHeader}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={24}
                  color={theme.colors.error}
                />
                <Title style={[styles.sectionTitle, { color: theme.colors.error, marginLeft: 8 }]}>
                  Zoonotic Risk
                </Title>
              </View>
              <Paragraph style={styles.warningText}>
                This disease can be transmitted to humans. Take appropriate precautions when handling infected animals.
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Bottom margin */}
        <View style={styles.bottomMargin} />
      </ScrollView>
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
  },
  headerCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  severityChip: {
    marginBottom: 8,
  },
  imageCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    padding: 0,
  },
  diseaseImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  envFactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  envFactorText: {
    marginLeft: 12,
    fontSize: 14,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    color: theme.colors.darkRed,
    fontWeight: 'bold',
  },
  bottomMargin: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  errorButton: {
    marginTop: 20,
  },
});

export default DiseaseDetailScreen;
