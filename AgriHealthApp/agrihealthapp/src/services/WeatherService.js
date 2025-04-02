import axios from 'axios';
import * as Location from 'expo-location';
import { WEATHER_API_KEY, WEATHER_API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service for handling weather data and forecasts in the AgriHealth app
 */
class WeatherService {
  /**
   * Get current location coordinates
   * @returns {Promise<{latitude: number, longitude: number}|null>} Location coordinates or null
   */
  async getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Get current weather data for coordinates
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object|null>} Weather data or null
   */
  async getCurrentWeather(latitude, longitude) {
    try {
      const response = await axios.get(`${WEATHER_API_URL}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: WEATHER_API_KEY,
          units: 'metric', // Use metric units (Celsius)
        },
      });

      return this.formatCurrentWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  /**
   * Get weather forecast for coordinates
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object|null>} Forecast data or null
   */
  async getWeatherForecast(latitude, longitude) {
    try {
      const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: WEATHER_API_KEY,
          units: 'metric', // Use metric units (Celsius)
        },
      });

      return this.formatForecastData(response.data);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return null;
    }
  }

  /**
   * Format current weather data
   * @param {Object} data - Raw weather data
   * @returns {Object} Formatted weather data
   * @private
   */
  formatCurrentWeatherData(data) {
    return {
      location: data.name,
      country: data.sys.country,
      date: new Date(data.dt * 1000).toLocaleDateString(),
      description: data.weather[0].description,
      icon: this.getWeatherIconUrl(data.weather[0].icon),
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      temp_min: Math.round(data.main.temp_min),
      temp_max: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      main: data.weather[0].main,
    };
  }

  /**
   * Format forecast data
   * @param {Object} data - Raw forecast data
   * @returns {Object} Formatted forecast data
   * @private
   */
  formatForecastData(data) {
    // Group forecast by day
    const forecastByDay = data.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        feels_like: Math.round(item.main.feels_like),
        description: item.weather[0].description,
        icon: this.getWeatherIconUrl(item.weather[0].icon),
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        main: item.weather[0].main,
      });

      return acc;
    }, {});

    // Convert to array of days with forecasts
    const daily = Object.keys(forecastByDay).map(date => ({
      date,
      forecasts: forecastByDay[date],
    }));

    return {
      city: data.city.name,
      country: data.city.country,
      daily,
    };
  }

  /**
   * Get weather icon URL
   * @param {string} icon - Icon code from API
   * @returns {string} Icon URL
   * @private
   */
  getWeatherIconUrl(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  /**
   * Get agricultural recommendations based on weather
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {Object} Agricultural recommendations
   */
  getAgriculturalRecommendations(weather, forecast) {
    const recommendations = {
      watering: this.getWateringRecommendation(weather, forecast),
      spraying: this.getSprayingRecommendation(weather, forecast),
      planting: this.getPlantingRecommendation(weather, forecast),
      harvesting: this.getHarvestingRecommendation(weather, forecast),
      general: this.getGeneralRecommendation(weather, forecast),
    };

    return recommendations;
  }

  /**
   * Get watering recommendations
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {string} Recommendation
   * @private
   */
  getWateringRecommendation(weather, forecast) {
    // Check if it's going to rain in the next 24 hours
    const willRainSoon = forecast.daily[0].forecasts.some(f =>
      f.main === 'Rain' || f.main === 'Thunderstorm' || f.main === 'Drizzle'
    );

    // Check if it's currently raining
    const isRaining = weather.main === 'Rain' || weather.main === 'Thunderstorm' || weather.main === 'Drizzle';

    // Check if it's too hot
    const isHot = weather.temp > 30;

    if (isRaining) {
      return 'Skip watering today as it is currently raining.';
    } else if (willRainSoon) {
      return 'Consider skipping watering as rain is expected in the next 24 hours.';
    } else if (isHot) {
      return 'Water early in the morning or late in the evening to minimize evaporation due to high temperatures.';
    } else {
      return 'Good conditions for regular watering. Water deeply and infrequently to encourage deep root growth.';
    }
  }

  /**
   * Get spraying recommendations
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {string} Recommendation
   * @private
   */
  getSprayingRecommendation(weather, forecast) {
    // Check weather conditions
    const isWindy = weather.wind_speed > 10; // More than 10 km/h
    const isRaining = weather.main === 'Rain' || weather.main === 'Thunderstorm' || weather.main === 'Drizzle';
    const willRainSoon = forecast.daily[0].forecasts.some(f =>
      f.main === 'Rain' || f.main === 'Thunderstorm' || f.main === 'Drizzle'
    );

    if (isWindy) {
      return 'Avoid spraying due to high winds which can cause drift.';
    } else if (isRaining || willRainSoon) {
      return 'Avoid spraying as rain will wash away chemicals.';
    } else {
      return 'Good conditions for spraying. Apply in early morning when winds are calm.';
    }
  }

  /**
   * Get planting recommendations
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {string} Recommendation
   * @private
   */
  getPlantingRecommendation(weather, forecast) {
    const isCold = weather.temp < 10;
    const isHot = weather.temp > 30;
    const soilCondition = this.estimateSoilCondition(weather, forecast);

    if (isCold) {
      return 'Too cold for planting most crops. Consider using cold frames or waiting for warmer weather.';
    } else if (isHot) {
      return 'Plant in the evening to avoid heat stress. Provide shade for sensitive seedlings.';
    } else if (soilCondition === 'wet') {
      return 'Soil may be too wet for planting. Wait until soil dries out to avoid compaction.';
    } else {
      return 'Good conditions for planting. Ensure proper seed depth and spacing.';
    }
  }

  /**
   * Get harvesting recommendations
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {string} Recommendation
   * @private
   */
  getHarvestingRecommendation(weather, forecast) {
    const isRaining = weather.main === 'Rain' || weather.main === 'Thunderstorm' || weather.main === 'Drizzle';
    const willRainSoon = forecast.daily[0].forecasts.some(f =>
      f.main === 'Rain' || f.main === 'Thunderstorm' || f.main === 'Drizzle'
    );

    if (isRaining) {
      return 'Delay harvesting until conditions are dry to prevent crop damage and disease.';
    } else if (willRainSoon) {
      return 'Consider harvesting soon before rain arrives. Prioritize mature crops that could be damaged by moisture.';
    } else {
      return 'Good conditions for harvesting. Harvest in the morning when temperatures are cooler.';
    }
  }

  /**
   * Get general recommendations
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {string} Recommendation
   * @private
   */
  getGeneralRecommendation(weather, forecast) {
    // Check for extreme weather
    const isExtremeHeat = weather.temp > 35;
    const isFreezingRisk = weather.temp_min < 2;
    const isStormComing = forecast.daily[0].forecasts.some(f => f.main === 'Thunderstorm');

    if (isExtremeHeat) {
      return 'Extreme heat alert! Provide extra water for plants and shade for sensitive crops.';
    } else if (isFreezingRisk) {
      return 'Frost risk! Protect sensitive plants with covers or bring potted plants indoors.';
    } else if (isStormComing) {
      return 'Storms expected! Secure any loose items and provide support for tall plants.';
    } else {
      return 'Normal weather conditions. Continue regular agricultural activities.';
    }
  }

  /**
   * Estimate soil condition based on recent weather
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {string} Soil condition ('dry', 'moist', or 'wet')
   * @private
   */
  estimateSoilCondition(weather, forecast) {
    // Simple estimation based on current conditions
    if (weather.main === 'Rain' || weather.main === 'Thunderstorm') {
      return 'wet';
    } else if (weather.humidity > 70) {
      return 'moist';
    } else {
      return 'dry';
    }
  }

  /**
   * Save weather data to local storage
   * @param {Object} weather - Weather data to save
   * @returns {Promise<void>}
   */
  async saveWeatherData(weather) {
    try {
      const weatherData = {
        ...weather,
        timestamp: new Date().getTime(),
      };

      await AsyncStorage.setItem('weatherData', JSON.stringify(weatherData));
    } catch (error) {
      console.error('Error saving weather data:', error);
    }
  }

  /**
   * Get cached weather data from local storage
   * @returns {Promise<Object|null>} Weather data or null
   */
  async getCachedWeatherData() {
    try {
      const weatherData = await AsyncStorage.getItem('weatherData');

      if (!weatherData) return null;

      const parsedData = JSON.parse(weatherData);
      const timestamp = parsedData.timestamp || 0;
      const now = new Date().getTime();

      // Check if data is older than 1 hour (3600000 ms)
      if (now - timestamp > 3600000) {
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error('Error getting cached weather data:', error);
      return null;
    }
  }

  /**
   * Mock weather data for development/testing
   * @returns {Object} Mock weather data
   */
  getMockWeatherData() {
    const currentWeather = {
      location: 'Sample City',
      country: 'Country',
      date: new Date().toLocaleDateString(),
      description: 'Sunny with some clouds',
      icon: 'https://openweathermap.org/img/wn/02d@2x.png',
      temp: 24,
      feels_like: 26,
      temp_min: 22,
      temp_max: 28,
      humidity: 65,
      wind_speed: 5.2,
      sunrise: '06:30',
      sunset: '19:45',
      main: 'Clear',
    };

    const forecast = {
      city: 'Sample City',
      country: 'Country',
      daily: [
        {
          date: new Date().toLocaleDateString(),
          forecasts: [
            {
              time: '12:00',
              temp: 24,
              feels_like: 26,
              description: 'Sunny with some clouds',
              icon: 'https://openweathermap.org/img/wn/02d@2x.png',
              humidity: 65,
              wind_speed: 5.2,
              main: 'Clear',
            },
            {
              time: '15:00',
              temp: 26,
              feels_like: 28,
              description: 'Clear sky',
              icon: 'https://openweathermap.org/img/wn/01d@2x.png',
              humidity: 60,
              wind_speed: 4.8,
              main: 'Clear',
            },
            {
              time: '18:00',
              temp: 23,
              feels_like: 24,
              description: 'Few clouds',
              icon: 'https://openweathermap.org/img/wn/02d@2x.png',
              humidity: 68,
              wind_speed: 4.2,
              main: 'Clear',
            },
          ],
        },
        {
          date: new Date(Date.now() + 86400000).toLocaleDateString(),
          forecasts: [
            {
              time: '09:00',
              temp: 22,
              feels_like: 23,
              description: 'Scattered clouds',
              icon: 'https://openweathermap.org/img/wn/03d@2x.png',
              humidity: 70,
              wind_speed: 5.5,
              main: 'Clouds',
            },
            {
              time: '12:00',
              temp: 25,
              feels_like: 26,
              description: 'Broken clouds',
              icon: 'https://openweathermap.org/img/wn/04d@2x.png',
              humidity: 65,
              wind_speed: 6.1,
              main: 'Clouds',
            },
            {
              time: '15:00',
              temp: 24,
              feels_like: 25,
              description: 'Light rain',
              icon: 'https://openweathermap.org/img/wn/10d@2x.png',
              humidity: 75,
              wind_speed: 5.8,
              main: 'Rain',
            },
          ],
        },
      ],
    };

    return { currentWeather, forecast };
  }
}

export default new WeatherService();
