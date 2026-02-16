import { AuraBackground } from '@/src/components/AuraBackground';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function HomeScreen() {
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <AuraBackground>
      <View style={styles.container}>
        
        <Animated.View 
          entering={FadeInUp.delay(200).duration(800)} 
          style={styles.header}
        >
          <Text style={styles.logo}>
            AuraEng<Text style={styles.accent}>&</Text>
          </Text>
          <Text style={styles.tagline}>Upgrade your vibe</Text>
        </Animated.View>

        <View style={styles.content}>
           <TouchableOpacity 
             style={styles.placeholderCard} 
             onPress={handlePress}
             activeOpacity={0.7}
           >
             <Text style={styles.emoji}>✨</Text>
             <Text style={styles.cardTitle}>Ready for a Quest?</Text>
             <Text style={styles.cardSub}>Торкнись, щоб відчути відгук</Text>
           </TouchableOpacity>
        </View>

      </View>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 80, 
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  accent: {
    color: '#38BDF8', 
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#38BDF8',
    marginTop: 8,
    fontSize: 14,
  }
});