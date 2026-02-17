import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { AuraBackground } from '@/src/components/AuraBackground';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();
 const handlePress = (title: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  if (title === "Vocabulary") {
    router.push('/vocabulary');
  }
  if (title === "Quizzes") {
    router.push({
      pathname: '/quiz',
      params: { type: 'toBe', title: 'To Be Verb' }
    });
  }
};

  const Card = ({ title, emoji, sub, delay, color = '#38BDF8' }: any) => (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()} 
      style={styles.cardContainer}
    >
      <TouchableOpacity onPress={() => handlePress(title)} activeOpacity={0.8}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSub}>{sub}</Text>
      
          <View style={[styles.indicator, { backgroundColor: color }]} />
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <AuraBackground>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.logo}>AuraEng<Text style={{color: '#38BDF8'}}>&</Text></Text>
        </View>

        <View style={styles.grid}>
          <Card 
            title="Vocabulary" 
            emoji="📚" 
            sub="50 new words" 
            delay={200} 
            color="#38BDF8" 
          />
          <Card 
            title="Quizzes" 
            emoji="🧩" 
            sub="Daily Challenge" 
            delay={400} 
            color="#FBBF24" 
          />
          <Card 
            title="AI Chat" 
            emoji="🤖" 
            sub="Practice speaking" 
            delay={600} 
            color="#22C55E" 
          />
          <Card 
            title="Stats" 
            emoji="⚡️" 
            sub="Level 5 / Pro" 
            delay={800} 
            color="#EF4444" 
          />
        </View>

        <Animated.View entering={FadeInDown.delay(1000)} style={styles.mainActionWrapper}>
           <BlurView intensity={40} tint="light" style={styles.mainActionCard}>
              <Text style={styles.mainActionText}>🔥 Ready for your 5-min session?</Text>
           </BlurView>
        </Animated.View>

      </ScrollView>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 120, 
  },
  header: {
    marginBottom: 30,
  },
  welcome: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F8FAF8',
    letterSpacing: -1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 15,
  },
  glassCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', 
    overflow: 'hidden',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#F8FAF8',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mainActionWrapper: {
    marginTop: 20,
  },
  mainActionCard: {
    padding: 25,
    borderRadius: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.1)', 
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainActionText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
  }
});