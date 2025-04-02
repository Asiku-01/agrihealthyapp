import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Text,
  StatusBar
} from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../config/theme';

const CameraScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [aiMode, setAiMode] = useState(route.params?.aiMode || false); // New AI mode parameter
  const [captureGuideVisible, setCaptureGuideVisible] = useState(true);

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permissions to use this feature.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        setPreviewImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const toggleCaptureGuide = () => {
    setCaptureGuideVisible(!captureGuideVisible);
  };

  const discardPhoto = () => {
    setPreviewImage(null);
  };

  const confirmPhoto = () => {
    if (route.params?.onPictureTaken && previewImage) {
      route.params.onPictureTaken(previewImage, aiMode);
      navigation.goBack();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="no-photography" size={60} color={theme.colors.gray} />
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {previewImage ? (
        // Preview screen after taking a photo
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewImage }} style={styles.previewImage} />

          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.previewButton} onPress={discardPhoto}>
              <MaterialIcons name="close" size={30} color="white" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.previewButton} onPress={confirmPhoto}>
              <MaterialIcons name="check" size={30} color="white" />
              <Text style={styles.previewButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Camera view
        <>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
            flashMode={flash}
            ratio="4:3"
          />

          <View style={styles.controlsContainer}>
            <SafeAreaView style={styles.controls} edges={['bottom']}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleFlash}
              >
                <MaterialIcons
                  name={flash === Camera.Constants.FlashMode.on ? "flash-on" : "flash-off"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </SafeAreaView>
          </View>

          {captureGuideVisible && (
            <View style={styles.cameraGuide}>
              <View style={styles.guideFrame} />
            </View>
          )}

          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {aiMode
                ? "Position plant clearly for AI diagnosis"
                : "Position the plant/animal in the frame"}
            </Text>
          </View>

          {/* AI Mode Indicator */}
          {aiMode && (
            <View style={styles.aiModeIndicator}>
              <MaterialIcons name="auto-awesome" size={20} color={theme.colors.primary} />
              <Text style={styles.aiModeText}>AI Diagnosis Mode</Text>
            </View>
          )}

          {/* Additional Controls */}
          <View style={styles.additionalControls}>
            <TouchableOpacity
              style={styles.controlOption}
              onPress={toggleCaptureGuide}
            >
              <MaterialIcons
                name={captureGuideVisible ? "grid-off" : "grid-on"}
                size={22}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlOption, aiMode && styles.controlOptionActive]}
              onPress={() => setAiMode(!aiMode)}
            >
              <MaterialIcons
                name="smart-toy"
                size={22}
                color={aiMode ? theme.colors.primary : "white"}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  previewButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewButton: {
    alignItems: 'center',
  },
  previewButtonText: {
    color: 'white',
    marginTop: 5,
  },
  cameraGuide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  hintContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  aiModeIndicator: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 5,
  },
  aiModeText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  additionalControls: {
    position: 'absolute',
    top: 150,
    right: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  controlOptionActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
});

export default CameraScreen;
