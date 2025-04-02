import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Text, Card, Button, ActivityIndicator, Title, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../config/theme';
import axios from 'axios';
import { API_URL, WEATHER_API_URL, WEATHER_API_KEY } from '../config/api';

const { width } = Dimensions.get('window');

// Plant types with icons
const plantTypes = [
  { id: 'eggplant', name: 'Eggplant', icon: '🍆' },
  { id: 'apple', name: 'Apple', icon: '🍎' },
  { id: 'corn', name: 'Corn', icon: '🌽' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
  { id: 'add', name: 'More', icon: '➕' },
];

// Quick links for the dashboard
const quickLinks = [
  {
    id: 'fertilizer',
    title: 'Fertilizer Calculator',
    icon: 'calculator-variant',
    screen: 'FertilizerCalculator'
  },
  {
    id: 'diseases',
    title: 'Pests & Diseases',
    icon: 'bug',
    screen: 'PlantDiseaseLibrary'
  },
  {
    id: 'tips',
    title: 'Cultivation Tips',
    icon: 'lightbulb-on',
    screen: 'CultivationTips'
  },
];

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);

  useEffect(() => {
    fetchWeatherData();
    fetchRecentDiagnoses();
  }, []);

  const fetchWeatherData = async () => {
    try {
      // In a real app, you would get the user's location first
      // For demo, we'll use a default location
      const lat = '40.7128';
      const lon = '-74.0060';

      const response = await axios.get(
        `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );

      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Set dummy weather data for demo
      setWeather({
        main: { temp: 24 },
        name: 'Your Location',
        weather: [{ main: 'Clear', icon: '01d' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentDiagnoses = async () => {
    try {
      // In a real app, you would fetch from your API
      // For demo, we'll use mock data
      setRecentDiagnoses([
        {
          id: '1',
          type: 'plant',
          speciesName: 'Tomato',
          diagnosisResult: 'Late Blight',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
          imageUrl: 'https://www.gardeningknowhow.com/wp-content/uploads/2019/05/late-blight.jpg'
        }
      ]);
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWeatherData(), fetchRecentDiagnoses()]);
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const navigateToDiagnosis = () => {
    navigation.navigate('Diagnosis');
  };

  const renderPlantType = ({ item }) => (
    <TouchableOpacity
      style={styles.plantTypeItem}
      onPress={() => item.id === 'add' ? console.log('Add more plants') : navigateToDiagnosis()}
    >
      <View style={styles.plantTypeIconContainer}>
        <Text style={styles.plantTypeIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.plantTypeName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderQuickLink = ({ item }) => (
    <TouchableOpacity
      style={styles.quickLinkItem}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.quickLinkContent}>
        <MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.gray} />
        <Text style={styles.quickLinkTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.username || 'Farmer'}</Text>
          </View>
        </View>

        {/* Plant Types Carousel */}
        <View style={styles.sectionContainer}>
          <FlatList
            data={plantTypes}
            renderItem={renderPlantType}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plantTypesList}
          />
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
          <FlatList
            data={quickLinks}
            renderItem={renderQuickLink}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.quickLinksContainer}
          />
        </View>

        {/* Diagnosis Call-to-Action */}
        <View style={styles.diagnosisSection}>
          <Title style={styles.sectionTitle}>Heal your crop</Title>
          <Card style={styles.diagnosisCard}>
            <Card.Content style={styles.diagnosisContent}>
              <View style={styles.diagnosisSteps}>
                <View style={styles.diagnosisStep}>
                  <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary} />
                  <Text style={styles.diagnosisStepText}>Take a picture</Text>
                </View>
                <MaterialIcons name="arrow-right-alt" size={24} color={theme.colors.gray} />
                <View style={styles.diagnosisStep}>
                  <MaterialIcons name="description" size={24} color={theme.colors.primary} />
                  <Text style={styles.diagnosisStepText}>See diagnosis</Text>
                </View>
                <MaterialIcons name="arrow-right-alt" size={24} color={theme.colors.gray} />
                <View style={styles.diagnosisStep}>
                  <MaterialIcons name="healing" size={24} color={theme.colors.primary} />
                  <Text style={styles.diagnosisStepText}>Get medicine</Text>
                </View>
              </View>
              <Button
                mode="contained"
                style={styles.diagnosisButton}
                onPress={navigateToDiagnosis}
              >
                Take A Picture
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Weather Section */}
        <View style={styles.weatherSection}>
          <Title style={styles.sectionTitle}>Weather</Title>
          <Card style={styles.weatherCard}>
            {loading ? (
              <Card.Content style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </Card.Content>
            ) : (
              <Card.Content style={styles.weatherContent}>
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherDate}>Today, {formatDate(new Date().toISOString())}</Text>
                  <Text style={styles.weatherTemp}>{Math.round(weather?.main?.temp || 0)}°C</Text>
                </View>
                <View style={styles.weatherIconContainer}>
                  {weather?.weather && weather.weather[0] && (
                    <Image
                      source={{
                        uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
                      }}
                      style={styles.weatherIcon}
                    />
                  )}
                </View>
              </Card.Content>
            )}
          </Card>
        </View>

        {/* Bottom Tab Navbar placeholder */}
        <View style={styles.navbarPlaceholder} />
      </ScrollView>

      {/* FAB for quick diagnosis */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={navigateToDiagnosis}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
  },
  plantTypesList: {
    paddingVertical: 10,
  },
  plantTypeItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  plantTypeIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: theme.colors.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantTypeIcon: {
    fontSize: 24,
  },
  plantTypeName: {
    fontSize: 12,
    color: theme.colors.text,
  },
  quickLinksSection: {
    marginBottom: 20,
  },
  quickLinksContainer: {
    justifyContent: 'space-between',
  },
  quickLinkItem: {
    width: (width - 40) / 3,
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    marginBottom: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  quickLinkContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkTitle: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.text,
  },
  diagnosisSection: {
    marginBottom: 20,
  },
  diagnosisCard: {
    borderRadius: 15,
    elevation: 2,
  },
  diagnosisContent: {
    padding: 10,
  },
  diagnosisSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  diagnosisStep: {
    alignItems: 'center',
  },
  diagnosisStepText: {
    fontSize: 10,
    marginTop: 5,
    color: theme.colors.text,
    textAlign: 'center',
  },
  diagnosisButton: {
    backgroundColor: theme.colors.primary,
  },
  weatherSection: {
    marginBottom: 20,
  },
  weatherCard: {
    borderRadius: 15,
    elevation: 2,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  weatherDate: {
    fontSize: 14,
    color: theme.colors.gray,
    marginBottom: 5,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  weatherIconContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 70,
    height: 70,
  },
  navbarPlaceholder: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: theme.colors.primary,
  },
});

export default HomeScreen;
