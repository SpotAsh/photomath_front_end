import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function SolutionScreen({ route, navigation }) {
  const { equation, solution, photoUri } = route.params || {};

  console.log('SolutionScreen received params:', { equation, solution, photoUri });

  if (!photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.noImageText}>No image captured</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Math Solution</Text>
      
      <Text style={styles.equationText}>
        Equation: {equation || 'No equation provided'}
      </Text>
      
      <Text style={styles.solutionText}>
        Solution: {solution || 'No solution provided'}
      </Text>
      
      <Image 
        source={{ uri: photoUri }} 
        style={styles.image}
        resizeMode="contain"
      />
      
      <Text style={styles.infoText}>
        Photo captured successfully!
      </Text>

      {/* Floating button in bottom-right */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.floatingButtonText}>📷</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    marginTop:50,
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
  equationText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  solutionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#228B22',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#228B22',
    borderRadius: 50,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
});
