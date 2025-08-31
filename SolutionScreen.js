import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SolutionScreen({ route }) {
  const { imageUri, imageBase64 } = route.params || {};

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.noImageText}>No image captured</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captured Image</Text>
      <Image 
        source={{ uri: imageUri }} 
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.infoText}>
        Image captured successfully!
      </Text>
      {imageBase64 && (
        <Text style={styles.infoText}>
          Base64 data available ({imageBase64.length} characters)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
});
