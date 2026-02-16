import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function AuraBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}