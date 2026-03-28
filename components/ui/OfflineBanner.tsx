import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export function OfflineBanner() {
  return (
    <View style={styles.container} accessibilityLabel="You are offline">
      <Text style={styles.text}>You're offline — changes will sync when reconnected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.warning,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
  },
});
