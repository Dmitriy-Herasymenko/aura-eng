import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export function AuraBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="grad"
            cx="0%"  
            cy="0%"   
            rx="100%" 
            ry="100%"
            fx="0%"
            fy="0%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#1E293B" stopOpacity="1" />
            <Stop offset="1" stopColor="#0F172A" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});