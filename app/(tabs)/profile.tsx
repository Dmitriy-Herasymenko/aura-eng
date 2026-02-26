import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AuraBackground } from '@/src/components/AuraBackground';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { progressService, UserProgress } from '@/src/services/progressService';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ProfileScreen() {
  const [stats, setStats] = useState<UserProgress | null>(null);

  // Оновлюємо дані щоразу, коли користувач відкриває вкладку профілю
  useFocusEffect(
    useCallback(() => {
      progressService.getProgress().then(data => setStats(data));
    }, [])
  );

  return (
    <AuraBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Твій Прогрес</Text>

        {/* Головна картка XP */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <BlurView intensity={20} tint="light" style={styles.mainCard}>
            <View style={styles.xpCircle}>
              <Ionicons name="flash" size={40} color="#FBBF24" />
            </View>
            <Text style={styles.points}>{stats?.totalPoints || 0}</Text>
            <Text style={styles.pointsLabel}>Усього досвіду (XP)</Text>
          </BlurView>
        </Animated.View>

        {/* Сітка статистики */}
        <View style={styles.statsGrid}>
          <BlurView intensity={15} tint="light" style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
            <Text style={styles.statValue}>{stats?.completedQuizzes.length || 0}</Text>
            <Text style={styles.statLabel}>Квізів</Text>
          </BlurView>

          <BlurView intensity={15} tint="light" style={styles.statBox}>
            <Ionicons name="book" size={24} color="#38BDF8" />
            <Text style={styles.statValue}>{stats?.learnedWordsCount || 0}</Text>
            <Text style={styles.statLabel}>Слів</Text>
          </BlurView>
        </View>

        {/* Прогрес по рівнях */}
        <Text style={styles.subHeader}>Рівні навчання</Text>
        
        <BlurView intensity={10} tint="light" style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.levelName}>Beginner (A1)</Text>
            <Text style={styles.percent}>
              {Math.min(Math.round(((stats?.learnedWordsCount || 0) / 50) * 100), 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min(((stats?.learnedWordsCount || 0) / 50) * 100), 100}%` }
              ]} 
            />
          </View>
        </BlurView>

        <TouchableOpacity 
          style={styles.resetBtn} 
          onPress={async () => {
             // Функція для скидання (опціонально)
          }}
        >
          <Text style={styles.resetText}>Скинути прогрес</Text>
        </TouchableOpacity>
      </ScrollView>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 80, paddingBottom: 120 },
  header: { color: '#F8FAF8', fontSize: 32, fontWeight: '900', marginBottom: 30 },
  mainCard: { padding: 30, borderRadius: 32, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  xpCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  points: { color: '#F8FAF8', fontSize: 48, fontWeight: '900' },
  pointsLabel: { color: '#38BDF8', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, marginTop: 5 },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statBox: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statValue: { color: '#F8FAF8', fontSize: 24, fontWeight: '800', marginTop: 8 },
  statLabel: { color: '#94A3B8', fontSize: 12 },
  subHeader: { color: '#F8FAF8', fontSize: 20, fontWeight: '800', marginBottom: 15 },
  progressCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  levelName: { color: '#F8FAF8', fontWeight: '700' },
  percent: { color: '#38BDF8', fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#38BDF8' },
  resetBtn: { marginTop: 40, alignItems: 'center' },
  resetText: { color: '#EF4444', fontSize: 14, fontWeight: '600' }
});