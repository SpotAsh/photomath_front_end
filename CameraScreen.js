import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

// BoundingBoxOverlay component
const BoundingBoxOverlay = ({ onTakePhoto }) => {
  return (
    <View style={styles.overlayContainer}>
      {/* Dark overlay covering entire screen */}
      <View style={styles.darkOverlay} />
      
      {/* Bounding box area - clear view */}
      <View style={styles.boundingBox} />
      
      {/* Take Photo Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onTakePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CameraScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [cameraDimensions, setCameraDimensions] = useState({ width: 0, height: 0 });
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleCameraLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setCameraDimensions({ width, height });
    console.log('Camera dimensions:', width, height);
  };

  const takePhoto = async () => {
    if (isCapturing || !cameraRef.current || cameraDimensions.width === 0) return;
    
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      
      console.log('Photo captured:', photo.uri);
      console.log('Photo dimensions:', photo.width, photo.height);
      console.log('Camera preview dimensions:', cameraDimensions.width, cameraDimensions.height);
      
      // Calculate bounding box dimensions and position relative to camera preview
      const boundingBoxWidth = cameraDimensions.width * 0.8; // 80% of camera preview width
      const boundingBoxHeight = 110; // Fixed height from styles
      const boundingBoxTop = cameraDimensions.height * 0.5; // 50% from top (marginTop: '50%')
      const boundingBoxLeft = (cameraDimensions.width - boundingBoxWidth) / 2; // Centered
      
      // Calculate crop rectangle by scaling from camera preview to photo dimensions
      const scaleX = photo.width / cameraDimensions.width;
      const scaleY = photo.height / cameraDimensions.height;
      
      const cropX = boundingBoxLeft * scaleX;
      const cropY = boundingBoxTop * scaleY;
      const cropWidth = boundingBoxWidth * scaleX;
      const cropHeight = boundingBoxHeight * scaleY;
      
      console.log('Crop rectangle:', { cropX, cropY, cropWidth, cropHeight });
      
      // Crop the image using ImageManipulator
      const croppedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX: cropX,
              originY: cropY,
              width: cropWidth,
              height: cropHeight,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      setPhotoUri(croppedPhoto.uri);
      console.log('Photo cropped:', croppedPhoto.uri);
      
      // Navigate to SolutionScreen with the cropped photo
      navigation.navigate('Solution', {
        equation: "2 + 2",
        solution: "4",
        photoUri: croppedPhoto.uri
      });
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing} 
        ref={cameraRef}
        onLayout={handleCameraLayout}
      />
      <BoundingBoxOverlay onTakePhoto={takePhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  boundingBox: {
    width: '80%',
    height: 110,
    borderWidth: 3,
    borderColor: '#228B22',
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginTop: '50%', // Position in top half of screen
    // Clear the dark overlay inside the bounding box
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    width: '80%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#228B22',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#228B22',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
