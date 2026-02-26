import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, GestureResponderEvent, ScrollView } from 'react-native';
import { AuraBackground } from '@/src/components/AuraBackground';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, interpolate, FadeInUp,
  FadeOut, FadeIn, ZoomIn
} from 'react-native-reanimated';
import { beginnerWords, intermediateWords, advancedWords } from '@/src/data/dataWords';
import { progressService } from '@/src/services/progressService';

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
  const [showXpAnim, setShowXpAnim] = useState(false);

  // Тест
  const [isTesting, setIsTesting] = useState(false);
  const [testAnswers, setTestAnswers] = useState<{ word: Word, isCorrect: boolean }[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [testFinished, setTestFinished] = useState(false);

  const spin = useSharedValue(0);
  const currentWords = allWords[level] || [];
  const currentWord: Word | undefined = currentWords[currentIndex];

  useEffect(() => {
    const loadSaved = async () => {
      const data = await AsyncStorage.getItem('savedWords');
      if (data) setSavedWords(JSON.parse(data));
    };
    loadSaved();
  }, []);

  const generateOptions = useCallback((index: number) => {
    const correct = currentWords[index].wordUA;
    const others = currentWords
      .filter((_, i) => i !== index)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.wordUA);
    setOptions([...others, correct].sort(() => 0.5 - Math.random()));
  }, [currentWords]);

  const startTest = () => {
    setIsTesting(true);
    setTestFinished(false);
    setCurrentIndex(0);
    setTestAnswers([]);
    generateOptions(0);
  };

  const handleTestAnswer = async (selected: string) => {
    const isCorrect = selected === currentWord?.wordUA;
    const newAnswers = [...testAnswers, { word: currentWord!, isCorrect }];
    setTestAnswers(newAnswers);

    if (currentIndex < currentWords.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      generateOptions(nextIndex);
    } else {
      setTestFinished(true);
      const correctCount = newAnswers.filter(a => a.isCorrect).length;
      const percent = (correctCount / currentWords.length) * 100;

      if (percent >= 90) {
        await progressService.addQuizResult(`mastered_${level}`, 150);
        setShowXpAnim(true);
        setTimeout(() => setShowXpAnim(false), 2000);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!currentWord) return;
    let newSaved = savedWords.some(w => w.id === currentWord.id)
      ? savedWords.filter(w => w.id !== currentWord.id)
      : [...savedWords, currentWord];
    setSavedWords(newSaved);
    await AsyncStorage.setItem('savedWords', JSON.stringify(newSaved));
    await progressService.updateWordsCount(newSaved.length);
  };

  const flipCard = () => { if (!isTesting) spin.value = withSpring(spin.value === 0 ? 1 : 0); };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(spin.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden'
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(spin.value, [0, 1], [180, 360])}deg` }],
    position: 'absolute',
    backfaceVisibility: 'hidden'
  }));

  const wrongAnswers = testAnswers.filter(a => !a.isCorrect);

  return (
    <AuraBackground>
      {showXpAnim && (
        <View style={styles.xpWrapper}>
           <Animated.Text entering={ZoomIn} exiting={FadeOut} style={styles.xpFloatingText}>+150 XP 🏆</Animated.Text>
        </View>
      )}

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => isTesting ? setIsTesting(false) : router.back()}>
            <Ionicons name="close-circle-outline" size={32} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={styles.viewTitle}>{isTesting ? "Тест" : "Словник"}</Text>
          <TouchableOpacity onPress={toggleFavorite} disabled={isTesting}>
            <Ionicons
              name={currentWord && savedWords.some(w => w.id === currentWord.id) ? "heart" : "heart-outline"}
              size={32}
              color={currentWord && savedWords.some(w => w.id === currentWord.id) ? "#EF4444" : "#F8FAF8"}
            />
          </TouchableOpacity>
        </View>

        {!isTesting ? (
          <>
            <View style={styles.levelRow}>
              {(['beginner', 'intermediate', 'advanced'] as Level[]).map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => { setLevel(lvl); setCurrentIndex(0); spin.value = 0; }}
                  style={[styles.levelBtn, level === lvl && styles.levelBtnActive]}
                >
                  <Text style={[styles.levelBtnText, level === lvl && styles.levelBtnTextActive]}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.cardArea}>
              <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.cardWrapper}>
                <Animated.View style={[styles.glassCard, frontStyle]}>
                  <BlurView intensity={25} tint="light" style={StyleSheet.absoluteFill} />
                  <Text style={styles.wordTransc}>{currentWord?.transcription}</Text>
                  <Text style={styles.wordText}>{currentWord?.wordEng}</Text>
                  <Text style={styles.exampleText}>{currentWord?.example}</Text>
                  <Text style={styles.hintText}>Натисніть, щоб перекласти</Text>
                </Animated.View>

                <Animated.View style={[styles.glassCard, backStyle]}>
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
                  <Text style={styles.cardBackText}>{currentWord?.wordUA}</Text>
                  <Text style={styles.hintText}>Натисніть, щоб повернути</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity onPress={() => currentIndex > 0 && setCurrentIndex(i => i - 1)} style={styles.navCircle}>
                <Ionicons name="chevron-back" size={28} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.pageIndicator}>{currentIndex + 1} / {currentWords.length}</Text>
              <TouchableOpacity onPress={() => currentIndex < currentWords.length - 1 && setCurrentIndex(i => i + 1)} style={styles.navCircle}>
                <Ionicons name="chevron-forward" size={28} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.startTestBtn} onPress={startTest}>
               <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
               <Text style={styles.startTestText}>🚀 Перевірити знання (Тест)</Text>
            </TouchableOpacity>
          </>
        ) : testFinished ? (
          <Animated.View entering={FadeIn} style={styles.resultContainer}>
            <Text style={styles.resultEmoji}>{wrongAnswers.length === 0 ? "🔥" : "📚"}</Text>
            <Text style={styles.resultTitle}>Тест завершено!</Text>
            <Text style={styles.resultScore}>Правильно: {currentWords.length - wrongAnswers.length} з {currentWords.length}</Text>
            
            {wrongAnswers.length > 0 && (
              <View style={styles.errorsBox}>
                <Text style={styles.errorTitle}>Потрібно підтягнути ці слова:</Text>
                {wrongAnswers.map((ans, i) => (
                  <View key={i} style={styles.errorItem}>
                    <Text style={styles.errorWord}>{ans.word.wordEng}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
                    <Text style={styles.errorCorrect}>{ans.word.wordUA}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={[styles.startTestBtn, { marginTop: 30 }]} onPress={() => setIsTesting(false)}>
               <Text style={styles.startTestText}>Повернутись до карток</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.testArea}>
            <Text style={styles.testProgress}>Питання {currentIndex + 1} з {currentWords.length}</Text>
            <Text style={styles.testWord}>{currentWord?.wordEng}</Text>
            <View style={styles.optionsGrid}>
              {options.map((opt, i) => (
                <TouchableOpacity key={i} onPress={() => handleTestAnswer(opt)} style={styles.optionBtn}>
                  <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  viewTitle: { color: '#F8FAF8', fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },
  levelRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  levelBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  levelBtnActive: { backgroundColor: '#38BDF8' },
  levelBtnText: { color: '#F8FAF8', fontWeight: 'bold', fontSize: 12 },
  levelBtnTextActive: { color: '#0F172A' },
  cardArea: { alignItems: 'center', marginVertical: 10 },
  cardWrapper: { width: '100%', height: 380, alignItems: 'center' },
  glassCard: { width: width * 0.85, height: 350, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', padding: 25 },
  wordText: { color: '#F8FAF8', fontSize: 36, fontWeight: '900', textAlign: 'center' },
  wordTransc: { color: '#38BDF8', fontSize: 18, marginBottom: 10 },
  exampleText: { color: '#94A3B8', textAlign: 'center', fontStyle: 'italic', marginTop: 15 },
  cardBackText: { color: '#38BDF8', fontSize: 32, fontWeight: '800' },
  hintText: { position: 'absolute', bottom: 20, color: 'rgba(148, 163, 184, 0.4)', fontSize: 10, textTransform: 'uppercase' },
  navRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30, marginTop: 10 },
  navCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8FAF8', justifyContent: 'center', alignItems: 'center' },
  pageIndicator: { color: '#38BDF8', fontWeight: 'bold' },
  startTestBtn: { marginTop: 40, width: '100%', height: 60, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#38BDF8' },
  startTestText: { color: '#38BDF8', fontWeight: '900', fontSize: 16 },
  testArea: { alignItems: 'center', marginTop: 20 },
  testProgress: { color: '#38BDF8', marginBottom: 10, fontWeight: 'bold' },
  testWord: { color: '#F8FAF8', fontSize: 42, fontWeight: '900', marginBottom: 40 },
  optionsGrid: { width: '100%', gap: 12 },
  optionBtn: { width: '100%', height: 65, borderRadius: 18, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  optionText: { color: '#F8FAF8', fontSize: 18, fontWeight: '600' },
  resultContainer: { alignItems: 'center', paddingTop: 40 },
  resultEmoji: { fontSize: 64, marginBottom: 10 },
  resultTitle: { color: '#F8FAF8', fontSize: 28, fontWeight: '900' },
  resultScore: { color: '#38BDF8', fontSize: 18, marginTop: 5, marginBottom: 30 },
  errorsBox: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)' },
  errorTitle: { color: '#EF4444', fontWeight: 'bold', marginBottom: 15 },
  errorItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  errorWord: { color: '#F8FAF8', fontWeight: '700', width: 100 },
  errorCorrect: { color: '#22C55E', fontWeight: '600' },
  xpWrapper: { position: 'absolute', top: 150, left: 0, right: 0, alignItems: 'center', zIndex: 1000 },
  xpFloatingText: { color: '#FBBF24', fontSize: 40, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 }
});