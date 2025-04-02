import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  Searchbar,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { theme } from '../../config/theme';

// Sample data for plant diseases
const mockPlantDiseases = [
  {
    id: '1',
    name: 'Late Blight',
    plantType: 'Tomato',
    description: 'Late blight is a potentially serious disease of potato and tomato plants, caused by the fungus Phytophthora infestans.',
    symptoms: ['Dark spots on leaves', 'White fungal growth', 'Brown lesions on stems'],
    severity: 'high',
    imageUrl: 'https://www.gardeningknowhow.com/wp-content/uploads/2019/05/late-blight.jpg'
  },
  {
    id: '2',
    name: 'Powdery Mildew',
    plantType: 'Cucumber',
    description: 'Powdery mildew is a fungal disease that affects a wide range of plants, particularly cucurbits.',
    symptoms: ['White powdery spots', 'Yellowing leaves', 'Distorted leaves'],
    severity: 'medium',
    imageUrl: 'https://www.planetnatural.com/wp-content/uploads/2012/12/powdery-mildew.jpg'
  },
  {
    id: '3',
    name: 'Apple Scab',
    plantType: 'Apple',
    description: 'Apple scab is a common disease of apple trees caused by the fungus Venturia inaequalis.',
    symptoms: ['Olive-green spots on leaves', 'Dark scab-like lesions on fruit', 'Premature leaf drop'],
    severity: 'medium',
    imageUrl: 'https://www.planetnatural.com/wp-content/uploads/2012/12/apple-scab-1.jpg'
  },
  {
    id: '4',
    name: 'Bacterial Leaf Spot',
    plantType: 'Pepper',
    description: 'Bacterial leaf spot is a common disease affecting pepper plants, caused by Xanthomonas bacteria.',
    symptoms: ['Small, dark, water-soaked spots', 'Yellow halos around spots', 'Leaf drop'],
    severity: 'medium',
    imageUrl: 'https://extension.umd.edu/sites/extension.umd.edu/files/styles/optimized/public/2021-03/HGIC_pepper_bacterial_spot.jpg?itok=fuRLjwrr'
  },
  {
    id: '5',
    name: 'Corn Rust',
    plantType: 'Corn',
    description: 'Corn rust is a fungal disease that affects corn production worldwide.',
    symptoms: ['Orange-brown pustules', 'Pustules turning dark brown', 'Leaf death'],
    severity: 'medium',
    imageUrl: 'https://agfax.com/wp-content/uploads/corn-rust-pustules-on-corn-leaf-texas-am-photo-1-1200x640.jpg'
  }
];

const PlantDiseaseLibraryScreen = ({ navigation }) => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [plantTypeFilter, setPlantTypeFilter] = useState(null);

  // Plant types for filtering
  const plantTypes = [...new Set(mockPlantDiseases.map(disease => disease.plantType))];

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [searchQuery, plantTypeFilter, diseases]);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      // const response = await axios.get(`${API_URL}/diseases/type/plant`);
      // setDiseases(response.data.diseases);

      // For demo, use mock data
      setTimeout(() => {
        setDiseases(mockPlantDiseases);
        setFilteredDiseases(mockPlantDiseases);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching plant diseases:', error);
      setDiseases([]);
      setFilteredDiseases([]);
      setLoading(false);
    }
  };

  const filterDiseases = () => {
    let filtered = [...diseases];

    // Apply plant type filter if selected
    if (plantTypeFilter) {
      filtered = filtered.filter(disease => disease.plantType === plantTypeFilter);
    }

    // Apply search query if present
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(disease =>
        disease.name.toLowerCase().includes(lowercaseQuery) ||
        disease.plantType.toLowerCase().includes(lowercaseQuery) ||
        disease.description.toLowerCase().includes(lowercaseQuery) ||
        disease.symptoms.some(symptom => symptom.toLowerCase().includes(lowercaseQuery))
      );
    }

    setFilteredDiseases(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDiseases();
    setRefreshing(false);
  };

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

  const navigateToDetails = (disease) => {
    navigation.navigate('DiseaseDetail', {
      disease,
      diseaseName: disease.name,
      type: 'plant'
    });
  };

  const renderDiseaseItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToDetails(item)}>
      <Card style={styles.diseaseCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.diseaseInfo}>
            <View style={styles.headerRow}>
              <Chip
                style={[
                  styles.plantTypeChip,
                  { backgroundColor: theme.colors.lightGreen }
                ]}
              >
                {item.plantType}
              </Chip>
              <Chip
                style={[
                  styles.severityChip,
                  { backgroundColor: getSeverityColor(item.severity) + '20' } // 20 is opacity
                ]}
                textStyle={{ color: getSeverityColor(item.severity) }}
              >
                {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)} Severity
              </Chip>
            </View>

            <Text style={styles.diseaseTitle}>{item.name}</Text>
            <Text style={styles.diseaseDescription} numberOfLines={2}>
              {item.description}
            </Text>

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
          </View>

          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.diseaseImage}
              resizeMode="cover"
            />
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderPlantTypeFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            plantTypeFilter === null && styles.filterChipSelected
          ]}
          onPress={() => setPlantTypeFilter(null)}
        >
          <Text style={[
            styles.filterChipText,
            plantTypeFilter === null && styles.filterChipTextSelected
          ]}>
            All Plants
          </Text>
        </TouchableOpacity>

        {plantTypes.map((type, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterChip,
              plantTypeFilter === type && styles.filterChipSelected
            ]}
            onPress={() => setPlantTypeFilter(plantTypeFilter === type ? null : type)}
          >
            <Text style={[
              styles.filterChipText,
              plantTypeFilter === type && styles.filterChipTextSelected
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="leaf-off" size={60} color={theme.colors.gray} />
      <Text style={styles.emptyText}>No plant diseases found</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search plant diseases..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {renderPlantTypeFilter()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading plant diseases...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDiseases}
            renderItem={renderDiseaseItem}
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
    marginBottom: 8,
    borderRadius: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text,
  },
  filterChipTextSelected: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  diseaseCard: {
    marginVertical: 4,
    borderRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
  },
  diseaseInfo: {
    flex: 1,
    paddingRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantTypeChip: {
    height: 28,
  },
  severityChip: {
    height: 28,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  diseaseDescription: {
    fontSize: 14,
    color: theme.colors.gray,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
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
  diseaseImage: {
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
});

export default PlantDiseaseLibraryScreen;
