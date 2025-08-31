import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
//import {Camera} from 'expo-camera';
import Camera from 'expo-camera';


export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('Camera permission status:', status); // <-- add this
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is required to use this feature.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });
      
      // Navigate to SolutionScreen with the captured image
      navigation.navigate('Solution', {
        imageUri: photo.uri,
        imageBase64: photo.base64,
      });
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants?.Type?.back || 1}
        //type="back"
      >
        {/* Bounding box overlay */}
        <View style={styles.boundingBox} />
        
        {/* Capture button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
  },
  boundingBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 200,
    marginLeft: -125,
    marginTop: -100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});
