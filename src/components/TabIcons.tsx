import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  color: string;
  focused?: boolean;
}


export const HomeIcon = ({ color, focused }: IconProps) => (
  <View style={styles.iconContainer}>
    {focused && <View style={[styles.iconGlow, { shadowColor: color }]} />}
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" 
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      />
      <Path d="M9 21V12H15V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);


export const QuestIcon = ({ color, focused }: IconProps) => (
  <View style={styles.iconContainer}>
    {focused && <View style={[styles.iconGlow, { shadowColor: color }]} />}
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);


export const DictionaryIcon = ({ color, focused }: IconProps) => (
  <View style={styles.iconContainer}>
    {focused && <View style={[styles.iconGlow, { shadowColor: color }]} />}
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

export const ProfileIcon = ({ color, focused }: IconProps) => (
  <View style={styles.iconContainer}>
    {focused && <View style={[styles.iconGlow, { shadowColor: color }]} />}
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#38BDF8',
    opacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    transform: [{ scale: 1.8 }],
  },
});