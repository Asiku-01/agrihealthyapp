import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import {
  Text,
  Button,
  Title,
  Avatar,
  Card,
  TextInput,
  Divider,
  IconButton,
  List,
  Switch
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../config/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useContext(AuthContext);

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const result = await updateProfile({
        username,
        phone,
        location
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setEditMode(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const renderUserInfo = () => (
    <Card style={styles.profileCard}>
      <Card.Content style={styles.profileCardContent}>
        <Avatar.Icon
          size={80}
          icon="account"
          style={styles.avatar}
          color="white"
        />
        <View style={styles.userInfoContainer}>
          <Title style={styles.nameText}>{user?.username || 'User'}</Title>
          <Text style={styles.emailText}>{user?.email || 'email@example.com'}</Text>
          <Text style={styles.roleText}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Farmer'}
          </Text>
        </View>
        <IconButton
          icon="pencil"
          size={24}
          onPress={() => setEditMode(true)}
          style={styles.editButton}
          color={theme.colors.primary}
        />
      </Card.Content>
    </Card>
  );

  const renderEditProfile = () => (
    <Card style={styles.profileCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Edit Profile</Title>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary } }}
        />

        <TextInput
          label="Phone (Optional)"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary } }}
        />

        <TextInput
          label="Location (Optional)"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary } }}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => setEditMode(false)}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Save
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Profile Information */}
        {editMode ? renderEditProfile() : renderUserInfo()}

        {/* Settings */}
        {!editMode && (
          <>
            <Card style={styles.settingsCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>App Settings</Title>

                <List.Item
                  title="Push Notifications"
                  description="Receive push notifications for diagnosis results and tips"
                  left={props => <List.Icon {...props} icon="bell-outline" />}
                  right={() =>
                    <Switch
                      value={pushNotifications}
                      onValueChange={setPushNotifications}
                      color={theme.colors.primary}
                    />
                  }
                />
                <Divider style={styles.divider} />

                <List.Item
                  title="Email Notifications"
                  description="Receive email updates about your diagnoses"
                  left={props => <List.Icon {...props} icon="email-outline" />}
                  right={() =>
                    <Switch
                      value={emailNotifications}
                      onValueChange={setEmailNotifications}
                      color={theme.colors.primary}
                    />
                  }
                />
                <Divider style={styles.divider} />

                <List.Item
                  title="Language"
                  description="English"
                  left={props => <List.Icon {...props} icon="translate" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => Alert.alert('Language', 'This feature is not available in the demo')}
                />
                <Divider style={styles.divider} />

                <List.Item
                  title="Theme"
                  description="Light Mode"
                  left={props => <List.Icon {...props} icon="theme-light-dark" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => Alert.alert('Theme', 'This feature is not available in the demo')}
                />
              </Card.Content>
            </Card>

            <Card style={styles.settingsCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Help & Support</Title>

                <List.Item
                  title="About AgriHealth App"
                  left={props => <List.Icon {...props} icon="information-outline" />}
                  onPress={() => Alert.alert('About', 'AgriHealth App v1.0.0\nDeveloped for agricultural health diagnosis')}
                />
                <Divider style={styles.divider} />

                <List.Item
                  title="Privacy Policy"
                  left={props => <List.Icon {...props} icon="shield-account" />}
                  onPress={() => Alert.alert('Privacy Policy', 'This is a demo app')}
                />
                <Divider style={styles.divider} />

                <List.Item
                  title="Terms of Service"
                  left={props => <List.Icon {...props} icon="file-document-outline" />}
                  onPress={() => Alert.alert('Terms of Service', 'This is a demo app')}
                />
                <Divider style={styles.divider} />

                <List.Item
                  title="Contact Support"
                  left={props => <List.Icon {...props} icon="help-circle-outline" />}
                  onPress={() => Alert.alert('Support', 'This is a demo app')}
                />
              </Card.Content>
            </Card>

            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.logoutButton}
              icon="logout"
              color={theme.colors.error}
            >
              Logout
            </Button>
          </>
        )}

        <View style={styles.bottomSpacer} />
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
  profileCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  userInfoContainer: {
    marginLeft: 20,
    flex: 1,
  },
  nameText: {
    fontSize: 22,
  },
  emailText: {
    color: theme.colors.gray,
    marginBottom: 4,
  },
  roleText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  editButton: {
    margin: 0,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  settingsCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  divider: {
    marginVertical: 2,
  },
  input: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: theme.colors.primary,
  },
  logoutButton: {
    marginVertical: 16,
    borderColor: theme.colors.error,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;
