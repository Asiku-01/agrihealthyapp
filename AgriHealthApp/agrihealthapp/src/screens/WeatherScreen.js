import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  FlatList
} from 'react-native';
import {
  Text,
  Title,
  Card,
  Divider,
  Button,
  Chip,
  List,
  IconButton,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import WeatherService from '../services/WeatherService';
import NotificationService from '../services/NotificationService';

const WeatherScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [expandedSection, setExpandedSection] = useState('general');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  // Fetch weather data on component mount
  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Fetch weather data
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for cached weather data first
      const cachedData = await WeatherService.getCachedWeatherData();
      if (cachedData) {
        setWeather(cachedData.currentWeather);
        setForecast(cachedData.forecast);
        setRecommendations(cachedData.recommendations);
        setLoading(false);
        return;
      }

      // Get current location
      const locationData = await WeatherService.getCurrentLocation();
      if (!locationData) {
        // If location not available, use mock data for development
        const mockData = WeatherService.getMockWeatherData();
        setWeather(mockData.currentWeather);
        setForecast(mockData.forecast);
        setRecommendations(WeatherService.getAgriculturalRecommendations(
          mockData.currentWeather,
          mockData.forecast
        ));
        setLoading(false);
        return;
      }

      setLocation(locationData);

      // Get current weather and forecast
      const [currentWeather, forecastData] = await Promise.all([
        WeatherService.getCurrentWeather(locationData.latitude, locationData.longitude),
        WeatherService.getWeatherForecast(locationData.latitude, locationData.longitude)
      ]);

      if (currentWeather && forecastData) {
        setWeather(currentWeather);
        setForecast(forecastData);

        // Get agricultural recommendations
        const agricRecommendations = WeatherService.getAgriculturalRecommendations(
          currentWeather,
          forecastData
        );
        setRecommendations(agricRecommendations);

        // Save weather data to cache
        await WeatherService.saveWeatherData({
          currentWeather,
          forecast: forecastData,
          recommendations: agricRecommendations
        });
      } else {
        throw new Error('Failed to fetch weather data');
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');

      // Use mock data as fallback
      const mockData = WeatherService.getMockWeatherData();
      setWeather(mockData.currentWeather);
      setForecast(mockData.forecast);
      setRecommendations(WeatherService.getAgriculturalRecommendations(
        mockData.currentWeather,
        mockData.forecast
      ));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeatherData();
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Send a weather alert as notification (demo feature)
  const sendWeatherAlert = async () => {
    if (weather) {
      await NotificationService.sendWeatherAlert({
        condition: weather.description,
        temperature: weather.temp,
        forecast: recommendations?.general || 'Check the app for agricultural recommendations.',
        location: weather.location
      });
      alert('Weather alert notification sent!');
    }
  };

  // Render weather icon with description
  const renderWeatherIcon = () => {
    if (!weather) return null;

    return (
      <View style={styles.weatherIconContainer}>
        <Image source={{ uri: weather.icon }} style={styles.weatherIcon} />
        <Text style={styles.weatherDescription}>{weather.description}</Text>
      </View>
    );
  };

  // Render a forecast item
  const renderForecastItem = ({ item }) => {
    return (
      <Surface style={styles.forecastItem}>
        <Text style={styles.forecastTime}>{item.time}</Text>
        <Image source={{ uri: item.icon }} style={styles.forecastIcon} />
        <Text style={styles.forecastTemp}>{item.temp}°C</Text>
        <Text style={styles.forecastDescription}>{item.description}</Text>
      </Surface>
    );
  };

  // Render a day's forecast
  const renderDayForecast = (day, index) => {
    const isToday = index === 0;

    return (
      <Card style={styles.forecastCard} key={day.date}>
        <Card.Content>
          <Text style={styles.forecastDate}>
            {isToday ? 'Today' : day.date}
          </Text>
          <FlatList
            data={day.forecasts}
            renderItem={renderForecastItem}
            keyExtractor={(item, idx) => `${day.date}-${idx}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastList}
          />
        </Card.Content>
      </Card>
    );
  };

  // Render agricultural recommendation card
  const renderRecommendationCard = (type, title, icon) => {
    if (!recommendations) return null;

    const isExpanded = expandedSection === type;
    const recommendation = recommendations[type];

    return (
      <Card style={styles.recommendationCard}>
        <TouchableOpacity onPress={() => toggleSection(type)}>
          <Card.Content style={styles.recommendationHeader}>
            <View style={styles.recommendationTitleContainer}>
              <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
              <Title style={styles.recommendationTitle}>{title}</Title>
            </View>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={theme.colors.gray}
            />
          </Card.Content>
        </TouchableOpacity>

        {isExpanded && (
          <Card.Content style={styles.recommendationContent}>
            <Divider style={styles.divider} />
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </Card.Content>
        )}
      </Card>
    );
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Fetching weather data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Error message if present */}
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorContent}>
              <MaterialCommunityIcons name="cloud-alert" size={24} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Current Weather Card */}
        <Card style={styles.weatherCard}>
          <Card.Content>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
              <Text style={styles.locationText}>
                {weather?.location}, {weather?.country}
              </Text>
              <Text style={styles.dateText}>{weather?.date}</Text>
            </View>

            <View style={styles.currentWeatherContainer}>
              {renderWeatherIcon()}

              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>{weather?.temp}°C</Text>
                <Text style={styles.feelsLike}>Feels like: {weather?.feels_like}°C</Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="water-percent" size={20} color={theme.colors.accent} />
                <Text style={styles.detailText}>Humidity: {weather?.humidity}%</Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="weather-windy" size={20} color={theme.colors.accent} />
                <Text style={styles.detailText}>Wind: {weather?.wind_speed} km/h</Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="weather-sunset-up" size={20} color={theme.colors.warning} />
                <Text style={styles.detailText}>Sunrise: {weather?.sunrise}</Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="weather-sunset-down" size={20} color={theme.colors.info} />
                <Text style={styles.detailText}>Sunset: {weather?.sunset}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Forecast Section */}
        <Title style={styles.sectionTitle}>Weather Forecast</Title>
        {forecast?.daily?.map(renderDayForecast)}

        {/* Agricultural Recommendations */}
        <Title style={styles.sectionTitle}>Agricultural Recommendations</Title>

        {renderRecommendationCard('general', 'General Advice', 'information-outline')}
        {renderRecommendationCard('watering', 'Watering', 'water')}
        {renderRecommendationCard('spraying', 'Spraying', 'spray')}
        {renderRecommendationCard('planting', 'Planting', 'seed')}
        {renderRecommendationCard('harvesting', 'Harvesting', 'food-apple')}

        {/* Weather Alert Button (Demo) */}
        <Button
          mode="contained"
          icon="bell-alert"
          onPress={sendWeatherAlert}
          style={styles.alertButton}
        >
          Send Weather Alert (Demo)
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.errorLight,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 10,
    color: theme.colors.error,
    flex: 1,
  },
  weatherCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  currentWeatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIconContainer: {
    alignItems: 'center',
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  weatherDescription: {
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  temperatureContainer: {
    alignItems: 'flex-end',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  feelsLike: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.primary,
  },
  forecastCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  forecastDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  forecastList: {
    paddingBottom: 8,
  },
  forecastItem: {
    padding: 10,
    marginRight: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    backgroundColor: theme.colors.surface,
    width: 100,
  },
  forecastTime: {
    fontSize: 14,
    marginBottom: 5,
  },
  forecastIcon: {
    width: 40,
    height: 40,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  forecastDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  recommendationCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  divider: {
    marginVertical: 10,
  },
  recommendationContent: {
    paddingTop: 0,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  alertButton: {
    marginTop: 20,
    marginBottom: 10,
  },
});

export default WeatherScreen;
