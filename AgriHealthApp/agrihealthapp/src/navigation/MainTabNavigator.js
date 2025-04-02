import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../config/theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import DiagnosisScreen from '../screens/diagnosis/DiagnosisScreen';
import CameraScreen from '../screens/diagnosis/CameraScreen';
import DiagnosisResultScreen from '../screens/diagnosis/DiagnosisResultScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import DiagnosisHistoryScreen from '../screens/diagnosis/DiagnosisHistoryScreen';
import PlantDiseaseLibraryScreen from '../screens/library/PlantDiseaseLibraryScreen';
import LivestockDiseaseLibraryScreen from '../screens/library/LivestockDiseaseLibraryScreen';
import DiseaseDetailScreen from '../screens/library/DiseaseDetailScreen';
import WeatherScreen from '../screens/WeatherScreen';

// Create stacks
const HomeStack = createStackNavigator();
const DiagnosisStack = createStackNavigator();
const CommunityStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const WeatherStack = createStackNavigator();

// Home Stack
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'AgriHealth App' }}
      />
      <HomeStack.Screen
        name="PlantDiseaseLibrary"
        component={PlantDiseaseLibraryScreen}
        options={{ title: 'Plant Diseases' }}
      />
      <HomeStack.Screen
        name="LivestockDiseaseLibrary"
        component={LivestockDiseaseLibraryScreen}
        options={{ title: 'Livestock Diseases' }}
      />
      <HomeStack.Screen
        name="DiseaseDetail"
        component={DiseaseDetailScreen}
        options={({ route }) => ({ title: route.params?.diseaseName || 'Disease Details' })}
      />
    </HomeStack.Navigator>
  );
}

// Diagnosis Stack
function DiagnosisStackNavigator() {
  return (
    <DiagnosisStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <DiagnosisStack.Screen
        name="DiagnosisMain"
        component={DiagnosisScreen}
        options={{ title: 'New Diagnosis' }}
      />
      <DiagnosisStack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'Take a Photo' }}
      />
      <DiagnosisStack.Screen
        name="DiagnosisResult"
        component={DiagnosisResultScreen}
        options={{ title: 'Diagnosis Result' }}
      />
      <DiagnosisStack.Screen
        name="DiagnosisHistory"
        component={DiagnosisHistoryScreen}
        options={{ title: 'Diagnosis History' }}
      />
    </DiagnosisStack.Navigator>
  );
}

// Weather Stack
function WeatherStackNavigator() {
  return (
    <WeatherStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <WeatherStack.Screen
        name="WeatherMain"
        component={WeatherScreen}
        options={{ title: 'Weather & Agriculture' }}
      />
    </WeatherStack.Navigator>
  );
}

// Community Stack
function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <CommunityStack.Screen
        name="CommunityMain"
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
    </CommunityStack.Navigator>
  );
}

// Profile Stack
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

// Bottom Tabs
const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Diagnosis"
        component={DiagnosisStackNavigator}
        options={{
          tabBarLabel: 'Diagnosis',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="stethoscope" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Weather"
        component={WeatherStackNavigator}
        options={{
          tabBarLabel: 'Weather',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="weather-partly-cloudy" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityStackNavigator}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-alt" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
