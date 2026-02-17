import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, GestureResponderEvent } from 'react-native';
import { AuraBackground } from '@/src/components/AuraBackground';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated';
import { beginnerWords, intermediateWords, advancedWords } from '@/src/data/dataWords';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');


interface Word {
  id: number;
  wordEng: string;
  wordUA: string;
  transcription: string;
  example: string;
}

type Level = 'beginner' | 'intermediate' | 'advanced';

const allWords: Record<Level, Word[]> = {
  beginner: beginnerWords,
  intermediate: intermediateWords,
  advanced: advancedWords
};

export default function VocabularyScreen() {
  const router = useRouter();
  
  const [level, setLevel] = useState<Level>('beginner');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, 
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, 
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, 
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      console.log("Audio mode setup error:", e);
    }
  };
  setupAudio();
}, []);
  
  const spin = useSharedValue(0);

  useEffect(() => {
    const loadSaved = async () => {
      const data = await AsyncStorage.getItem('savedWords');
      if (data) setSavedWords(JSON.parse(data));
    };
    loadSaved();
  }, []);

  const currentWords = allWords[level] || [];
  const currentWord: Word | undefined = currentWords[currentIndex];

  const toggleFavorite = async () => {
    if (!currentWord) return;
    let newSaved: Word[];
    const isSaved = savedWords.some(w => w.id === currentWord.id);
    if (isSaved) {
      newSaved = savedWords.filter(w => w.id !== currentWord.id);
    } else {
      newSaved = [...savedWords, currentWord];
    }
    setSavedWords(newSaved);
    await AsyncStorage.setItem('savedWords', JSON.stringify(newSaved));
  };

const speak = (e: GestureResponderEvent) => {
  e.stopPropagation();
  if (currentWord) {
    console.log("Speaking word:", currentWord.wordEng);
    Speech.stop();
    Speech.speak(currentWord.wordEng, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9, // Трохи повільніше для чіткості
      onStart: () => console.log("Speech started"),
      onError: (err) => console.log("Speech error:", err),
    });
  }
};

  const handleNext = () => {
    if (currentIndex < currentWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      spin.value = 0;
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFinished(false);
      spin.value = 0;
    }
  };

  const flipCard = () => { 
    if (!isFinished) spin.value = withSpring(spin.value === 0 ? 1 : 0); 
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(spin.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden'
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(spin.value, [0, 1], [180, 360])}deg` }],
    position: 'absolute',
    backfaceVisibility: 'hidden'
  }));

  return (
    <AuraBackground>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-circle-outline" size={32} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={styles.viewTitle}>{isFinished ? "Завершено" : `Рівень: ${level}`}</Text>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons 
              name={currentWord && savedWords.some(w => w.id === currentWord.id) ? "heart" : "heart-outline"} 
              size={32} 
              color={currentWord && savedWords.some(w => w.id === currentWord.id) ? "#EF4444" : "#F8FAF8"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.levelRow}>
          {(['beginner', 'intermediate', 'advanced'] as Level[]).map(lvl => (
            <TouchableOpacity 
              key={lvl} 
              onPress={() => { setLevel(lvl); setCurrentIndex(0); setIsFinished(false); spin.value = 0; }}
              style={[styles.levelBtn, level === lvl && styles.levelBtnActive]}
            >
              <Text style={[styles.levelBtnText, level === lvl && styles.levelBtnTextActive]}>
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.cardArea}>
          <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.cardWrapper}>
            {!isFinished && currentWord ? (
              <>
                <Animated.View style={[styles.glassCard, frontStyle]}>
                  <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
                  <TouchableOpacity onPress={speak} style={styles.speakIcon}>
                    <Ionicons name="volume-medium-outline" size={34} color="#38BDF8" />
                  </TouchableOpacity>
                  
                  <Text style={styles.wordTransc}>{currentWord.transcription}</Text>
                  <Text style={styles.wordText}>{currentWord.wordEng}</Text>
                  
                  <View style={styles.contextContainer}>
                    <Text style={styles.contextLabel}>Context</Text>
                    <Text style={styles.exampleText}>{currentWord.example}</Text>
                  </View>
                  
                  <Text style={styles.hintText}>Tap to flip</Text>
                </Animated.View>

     
                <Animated.View style={[styles.glassCard, backStyle]}>
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
                  <Text style={styles.cardBackText}>{currentWord.wordUA}</Text>
                  <Text style={styles.hintText}>Tap to see word</Text>
                </Animated.View>
              </>
            ) : (
              <View style={[styles.glassCard, styles.finishedCard]}>
                <Text style={styles.wordText}>Вітаємо! 🎉</Text>
                <Text style={styles.cardBackText}>Всі слова пройдено!</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handlePrev} 
            disabled={currentIndex === 0}
            style={[styles.navBtn, currentIndex === 0 && { opacity: 0.3 }]}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleNext} 
            disabled={isFinished}
            style={[styles.navBtn, styles.nextBtn, isFinished && { opacity: 0.3 }]}
          >
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewTitle: { color: '#F8FAF8', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  levelRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
  levelBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  levelBtnActive: { borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.15)' },
  levelBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 12 },
  levelBtnTextActive: { color: '#38BDF8' },
  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardWrapper: { width: '100%', height: 420, justifyContent: 'center', alignItems: 'center' },
  glassCard: { width: width * 0.85, height: 400, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', padding: 25 },
  wordText: { color: '#F8FAF8', fontSize: 40, fontWeight: '900', textAlign: 'center' },
  wordTransc: { color: '#38BDF8', fontSize: 18, marginBottom: 8, fontWeight: '500' },
  contextContainer: { marginTop: 25, alignItems: 'center', width: '100%' },
  contextLabel: { color: '#38BDF8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5, letterSpacing: 1 },
  exampleText: { color: '#94A3B8', textAlign: 'center', fontStyle: 'italic', fontSize: 15, lineHeight: 22 },
  cardBackText: { color: '#38BDF8', fontSize: 34, fontWeight: '800', textAlign: 'center' },
  speakIcon: { position: 'absolute', top: 25, right: 25, zIndex: 10, padding: 5 },
  hintText: { position: 'absolute', bottom: 25, color: 'rgba(148, 163, 184, 0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 140, alignItems: 'center' },
  navBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F8FAF8', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  nextBtn: { width: 140, flexDirection: 'row', gap: 10 },
  nextText: { color: '#0F172A', fontWeight: '900', fontSize: 18 },
  finishedCard: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: '#22C55E' }
});