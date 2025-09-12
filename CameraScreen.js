import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

// Overlay with measurable bounding box
const BoundingBoxOverlay = ({ onTakePhoto, onBoxLayout }) => {
  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      <View style={styles.darkOverlay} pointerEvents="none" />

      {/* This box is what we want to crop to; onLayout gives its exact screen coords */}
      <View
        style={styles.boundingBox}
        onLayout={({ nativeEvent: { layout } }) => onBoxLayout?.(layout)}
        pointerEvents="none"
      />

      <View style={styles.buttonContainer} pointerEvents="box-none">
        <TouchableOpacity style={styles.button} onPress={onTakePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [boxLayout, setBoxLayout] = useState(null); // {x, y, width, height}

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button title="grant permission" onPress={requestPermission} />
      </View>
    );
  }

  // Core: map preview coords -> photo coords accounting for "cover" scaling and centering
  const mapPreviewRectToPhoto = (photoW, photoH, previewW, previewH, rect) => {
    // Scale used by CameraView to "cover" the preview
    const scale = Math.max(previewW / photoW, previewH / photoH);
    const scaledW = photoW * scale;
    const scaledH = photoH * scale;

    // When covering, the image is centered; compute hidden offsets
    const offsetX = (previewW - scaledW) / 2; // <= 0 when width overflows
    const offsetY = (previewH - scaledH) / 2; // <= 0 when height overflows

    // Invert transform: (preview - offset) / scale -> photo space
    let originX = (rect.x - offsetX) / scale;
    let originY = (rect.y - offsetY) / scale;
    let width = rect.width / scale;
    let height = rect.height / scale;

    // Clamp to photo bounds
    originX = Math.max(0, Math.min(photoW, originX));
    originY = Math.max(0, Math.min(photoH, originY));
    width = Math.max(1, Math.min(photoW - originX, width));
    height = Math.max(1, Math.min(photoH - originY, height));

    return { originX, originY, width, height };
  };

  const takePhoto = async () => {
    if (isCapturing || !cameraRef.current || !boxLayout || previewSize.width === 0) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false, // ensures orientation is corrected
        base64: false,
      });

      // Map the measured box (preview space) to a crop rect in photo pixels
      const crop = mapPreviewRectToPhoto(
        photo.width,
        photo.height,
        previewSize.width,
        previewSize.height,
        boxLayout
      );

      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      navigation.navigate('Solution', {
        equation: '2 + 2',
        solution: '4',
        photoUri: cropped.uri,
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to take/crop photo.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onLayout={({ nativeEvent: { layout } }) =>
          setPreviewSize({ width: layout.width, height: layout.height })
        }
      />
      <BoundingBoxOverlay onTakePhoto={takePhoto} onBoxLayout={setBoxLayout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },

  // Overlay
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // This is the visual box the user sees. We measure its real position with onLayout.
  boundingBox: {
    width: '80%',
    height: 110,
    borderWidth: 3,
    borderColor: '#22AA22',
    borderRadius: 12,
    marginTop: '28%', // place it in the upper half; change as you like
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});
