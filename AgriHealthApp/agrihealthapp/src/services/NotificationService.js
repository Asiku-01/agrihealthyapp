import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';
import { PUSH_NOTIFICATION_API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service for handling push notifications in the AgriHealth app
 */
class NotificationService {
  /**
   * Register for push notifications
   * @returns {Promise<string|null>} Push token or null if not available
   */
  async registerForPushNotifications() {
    let token;

    if (!Device.isDevice) {
      console.log('Push Notifications not available on simulator/emulator');
      return null;
    }

    // Check for existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If no existing permission, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permission not granted, return null
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token: permission not granted');
      return null;
    }

    // Get push token
    try {
      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      token = expoPushToken.data;

      // Store token in AsyncStorage
      await AsyncStorage.setItem('pushToken', token);

      // On Android, set notification channel
      if (Platform.OS === 'android') {
        await this.setupAndroidNotificationChannel();
      }

      console.log('Push token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Set up Android notification channel
   * @private
   */
  async setupAndroidNotificationChannel() {
    await Notifications.setNotificationChannelAsync('diagnosis-updates', {
      name: 'Diagnosis Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });

    await Notifications.setNotificationChannelAsync('weather-alerts', {
      name: 'Weather Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
    });
  }

  /**
   * Configure notification handling
   * @param {Function} handleNotification - Function to handle incoming notifications
   * @param {Function} handleNotificationResponse - Function to handle notification responses
   */
  configureNotificationHandling(handleNotification, handleNotificationResponse) {
    // Configure how notifications are handled when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set up notification received listener
    const notificationListener = Notifications.addNotificationReceivedListener(
      handleNotification
    );

    // Set up notification response listener (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Return cleanup function
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  /**
   * Schedule a local notification
   * @param {Object} content - Notification content
   * @param {string} content.title - Notification title
   * @param {string} content.body - Notification body
   * @param {Object} content.data - Notification data payload
   * @param {string} channelId - Android notification channel ID
   * @param {number} seconds - Seconds to wait before showing notification
   * @returns {Promise<string>} Notification identifier
   */
  async scheduleLocalNotification(content, channelId = 'diagnosis-updates', seconds = 1) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        sound: true,
        priority: 'high',
        android: {
          channelId,
        },
      },
      trigger: { seconds },
    });
  }

  /**
   * Send push notification for diagnosis results
   * @param {Object} diagnosis - Diagnosis object
   * @param {string} pushToken - Push token to send notification to
   * @returns {Promise<boolean>} Success status
   */
  async sendDiagnosisResultNotification(diagnosis, pushToken) {
    if (!pushToken) return false;

    try {
      const response = await axios.post(PUSH_NOTIFICATION_API_URL, {
        to: pushToken,
        title: 'Diagnosis Result Available',
        body: `Your ${diagnosis.type} diagnosis for ${diagnosis.speciesName} is ready.`,
        data: {
          type: 'diagnosis_result',
          diagnosisId: diagnosis.id,
          result: diagnosis.diagnosisResult,
          createdAt: diagnosis.createdAt,
        },
        sound: 'default',
        badge: 1,
      });

      return response.status === 200;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send local notification for new diagnosis result
   * @param {Object} diagnosis - Diagnosis object
   */
  async notifyDiagnosisResult(diagnosis) {
    const title = 'Diagnosis Result Available';
    const body = `Your ${diagnosis.type} diagnosis for ${diagnosis.speciesName} is ready: ${diagnosis.diagnosisResult}`;

    await this.scheduleLocalNotification({
      title,
      body,
      data: {
        type: 'diagnosis_result',
        diagnosisId: diagnosis.id,
        screen: 'DiagnosisResult',
        params: { diagnosisId: diagnosis.id },
      },
    });
  }

  /**
   * Send weather alert notification
   * @param {Object} weatherData - Weather data
   */
  async sendWeatherAlert(weatherData) {
    const { condition, temperature, forecast, location } = weatherData;

    const title = `Weather Alert: ${condition} in ${location}`;
    const body = `Current temperature: ${temperature}°C. ${forecast}`;

    await this.scheduleLocalNotification({
      title,
      body,
      data: {
        type: 'weather_alert',
        weatherData,
        screen: 'Weather',
      },
    }, 'weather-alerts');
  }
}

export default new NotificationService();
