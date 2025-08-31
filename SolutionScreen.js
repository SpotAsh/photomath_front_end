import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SolutionScreen() {
  return (
    <View style={styles.container}>
      <Text>Solution Screen (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
