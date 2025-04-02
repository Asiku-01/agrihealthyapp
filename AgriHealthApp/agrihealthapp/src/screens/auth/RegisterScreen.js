import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../config/theme';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { register, isLoading, error } = useContext(AuthContext);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Reset errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate inputs
    let hasError = false;

    if (!username) {
      setUsernameError('Username is required');
      hasError = true;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      hasError = true;
    }

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    // Attempt registration
    const userData = {
      username,
      email,
      password,
      phone: phone || undefined,
      location: location || undefined,
      role: 'farmer' // Default role
    };

    const result = await register(userData);

    if (result.success) {
      // Registration successful, user will be automatically logged in
      console.log('Registration successful');
    } else {
      // Error is handled by AuthContext
      console.log('Registration failed:', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join AgriHealth App</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Username"
              value={username}
              onChangeText={text => setUsername(text)}
              mode="outlined"
              autoCapitalize="none"
              style={styles.input}
              error={!!usernameError}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={<TextInput.Icon icon="account" />}
            />
            {!!usernameError && <HelperText type="error">{usernameError}</HelperText>}

            <TextInput
              label="Email"
              value={email}
              onChangeText={text => setEmail(text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!emailError}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={<TextInput.Icon icon="email" />}
            />
            {!!emailError && <HelperText type="error">{emailError}</HelperText>}

            <TextInput
              label="Password"
              value={password}
              onChangeText={text => setPassword(text)}
              mode="outlined"
              secureTextEntry={!passwordVisible}
              style={styles.input}
              error={!!passwordError}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
            {!!passwordError && <HelperText type="error">{passwordError}</HelperText>}

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              mode="outlined"
              secureTextEntry={!confirmPasswordVisible}
              style={styles.input}
              error={!!confirmPasswordError}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={confirmPasswordVisible ? "eye-off" : "eye"}
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                />
              }
            />
            {!!confirmPasswordError && <HelperText type="error">{confirmPasswordError}</HelperText>}

            <TextInput
              label="Phone (Optional)"
              value={phone}
              onChangeText={text => setPhone(text)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="Location (Optional)"
              value={location}
              onChangeText={text => setLocation(text)}
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={<TextInput.Icon icon="map-marker" />}
            />

            {!!error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            >
              Register
            </Button>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    color: theme.colors.gray,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
