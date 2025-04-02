import { DefaultTheme } from 'react-native-paper';

// Custom theme for the app
export const theme = {
  ...DefaultTheme,
  // Dark theme can be DefaultTheme or DarkTheme
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50', // Green
    accent: '#2196F3',  // Blue
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#D32F2F',
    text: '#212121',
    onSurface: '#212121',
    disabled: '#BDBDBD',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF9800',

    // Custom colors
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    lightBackground: '#E8F5E9',
    darkGreen: '#388E3C',
    lightGreen: '#A5D6A7',
    darkBlue: '#1565C0',
    lightBlue: '#BBDEFB',
    darkRed: '#B71C1C',
    lightRed: '#FFCDD2',
    gray: '#757575',
    lightGray: '#EEEEEE',
  },
  // Custom font configuration
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  // Custom values
  roundness: 10,
  animation: {
    scale: 1.0,
  },
};
