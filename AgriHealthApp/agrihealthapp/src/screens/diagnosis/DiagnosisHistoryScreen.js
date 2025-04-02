import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Chip,
  ActivityIndicator,
  Searchbar,
  FAB,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { theme } from '../../config/theme';

// Sample data for diagnosis history
const mockDiagnoses = [
  {
    id: '1',
    type: 'plant',
    speciesName: 'Tomato',
    diagnosisResult: 'Late Blight',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    symptoms: ['Leaf spots', 'Wilting'],
    status: 'completed',
    confidence: 0.85,
    imageUrl: 'https://www.gardeningknowhow.com/wp-content/uploads/2019/05/late-blight.jpg'
  },
  {
    id: '2',
    type: 'livestock',
    speciesName: 'Dairy Cow',
    diagnosisResult: 'Mastitis',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    symptoms: ['Swollen udder', 'Abnormal milk'],
    status: 'completed',
    confidence: 0.92,
    imageUrl: 'https://www.dairyglobal.net/app/uploads/2020/12/001_103-848x565.jpg'
  },
  {
    id: '3',
    type: 'plant',
    speciesName: 'Apple',
    diagnosisResult: 'Apple Scab',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    symptoms: ['Dark spots on leaves', 'Yellowing'],
    status: 'completed',
    confidence: 0.78,
    imageUrl: 'https://www.planetnatural.com/wp-content/uploads/2012/12/apple-scab-1.jpg'
  }
];

const DiagnosisHistoryScreen = ({ navigation }) => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDiagnoses, setFilteredDiagnoses] = useState([]);

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = diagnoses.filter(diagnosis =>
        diagnosis.speciesName.toLowerCase().includes(lowercaseQuery) ||
        diagnosis.diagnosisResult.toLowerCase().includes(lowercaseQuery) ||
        diagnosis.type.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredDiagnoses(filtered);
    } else {
      setFilteredDiagnoses(diagnoses);
    }
  }, [searchQuery, diagnoses]);

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      // const response = await axios.get(`${API_URL}/diagnosis/history`);
      // setDiagnoses(response.data.diagnoses);

      // For demo, use mock data
      setTimeout(() => {
        setDiagnoses(mockDiagnoses);
        setFilteredDiagnoses(mockDiagnoses);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      setDiagnoses([]);
      setFilteredDiagnoses([]);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDiagnoses();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigateToDetails = (diagnosis) => {
    // In a real app, you would fetch detailed diagnosis data from the API
    // For demo, navigate with existing data
    navigation.navigate('DiagnosisResult', {
      diagnosis,
      // Mock disease details based on diagnosis type and result
      diseaseDetails: {
        name: diagnosis.diagnosisResult,
        description: diagnosis.type === 'plant'
          ? 'A common fungal disease affecting plants, causing leaf spots and eventual defoliation.'
          : 'An inflammatory condition affecting the udder tissue in dairy animals.',
        symptoms: diagnosis.symptoms,
        causes: diagnosis.type === 'plant'
          ? 'Caused by fungal pathogens that thrive in wet, humid conditions.'
          : 'Caused by bacterial infection, often due to poor milking hygiene or mechanical injury.',
        preventionMethods: diagnosis.type === 'plant'
          ? ['Proper spacing for airflow', 'Avoid overhead watering', 'Use resistant varieties']
          : ['Good milking hygiene', 'Clean housing', 'Regular equipment maintenance'],
        treatmentMethods: diagnosis.type === 'plant'
          ? ['Apply appropriate fungicides', 'Remove affected leaves', 'Improve drainage']
          : ['Antibiotics as prescribed', 'Anti-inflammatory treatment', 'Frequent milking']
      }
    });
  };

  const renderDiagnosisItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToDetails(item)}>
      <Card style={styles.diagnosisCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.diagnosisInfo}>
            <View style={styles.headerRow}>
              <Chip
                icon={item.type === 'plant' ? 'leaf' : 'cow'}
                style={[
                  styles.typeChip,
                  { backgroundColor: item.type === 'plant' ? theme.colors.lightGreen : theme.colors.lightBlue }
                ]}
              >
                {item.type === 'plant' ? 'Plant' : 'Livestock'}
              </Chip>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>

            <Text style={styles.diagnosisTitle}>{item.diagnosisResult}</Text>
            <Text style={styles.speciesText}>{item.speciesName}</Text>

            <View style={styles.chipContainer}>
              {item.symptoms.slice(0, 2).map((symptom, index) => (
                <Chip key={index} style={styles.symptomChip} textStyle={styles.symptomText}>
                  {symptom}
                </Chip>
              ))}
              {item.symptoms.length > 2 && (
                <Chip style={styles.symptomChip} textStyle={styles.symptomText}>
                  +{item.symptoms.length - 2} more
                </Chip>
              )}
            </View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                Confidence: {Math.round(item.confidence * 100)}%
              </Text>
            </View>
          </View>

          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.diagnosisImage}
              resizeMode="cover"
            />
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="history" size={60} color={theme.colors.gray} />
      <Text style={styles.emptyText}>No diagnosis history found</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search diagnoses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading diagnosis history...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDiagnoses}
            renderItem={renderDiagnosisItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={EmptyListComponent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        <FAB
          style={styles.fab}
          icon="plus"
          color="#fff"
          onPress={() => navigation.navigate('DiagnosisMain')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  diagnosisCard: {
    marginVertical: 4,
    borderRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
  },
  diagnosisInfo: {
    flex: 1,
    paddingRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    height: 28,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  speciesText: {
    fontSize: 14,
    color: theme.colors.gray,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  symptomChip: {
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.lightGray,
  },
  symptomText: {
    fontSize: 10,
  },
  confidenceContainer: {
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  diagnosisImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default DiagnosisHistoryScreen;
