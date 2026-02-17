import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { AuraBackground } from '@/src/components/AuraBackground';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { toBeQuiz, pronounsQuiz, articlesQuiz, presentSimpleQuiz } from '@/src/data/dataQuiz';

const { width } = Dimensions.get('window');

const allQuizzes: Record<string, any[]> = {
  toBe: toBeQuiz,
  pronouns: pronounsQuiz,
  articles: articlesQuiz,
  presentSimple: presentSimpleQuiz,
};


const topics = [
  { id: 'toBe', title: 'To Be Verb', desc: 'am, is, are', icon: 'flash', color: '#38BDF8' },
  { id: 'pronouns', title: 'Pronouns', desc: 'I, you, he, she', icon: 'people', color: '#A855F7' },
  { id: 'articles', title: 'Articles', desc: 'a, an, the', icon: 'text', color: '#FACC15' },
  { id: 'presentSimple', title: 'Present Simple', desc: 'Daily routine', icon: 'time', color: '#22C55E' },
];

export default function QuizScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{status: 'correct' | 'wrong' | null, msg: string}>({status: null, msg: ''});
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const data = allQuizzes[type] || [];
    setQuizData([...data].sort(() => Math.random() - 0.5));
    setSelectedType(type);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  const handleAnswer = (option: string) => {
    if (feedback.status) return;
    const currentQ = quizData[currentIndex];
    
    if (option === currentQ.answer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback({status: 'correct', msg: '✨ Правильно!'});
      setScore(s => s + 1);
      setTimeout(() => {
        setFeedback({status: null, msg: ''});
        if (currentIndex < quizData.length - 1) setCurrentIndex(i => i + 1);
        else setIsFinished(true);
      }, 1000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback({status: 'wrong', msg: '❌ Спробуй ще раз'});
      setTimeout(() => setFeedback({status: null, msg: ''}), 1000);
    }
  };

  return (
    <AuraBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        

        <View style={styles.header}>
          <TouchableOpacity onPress={() => selectedType ? setSelectedType(null) : router.back()}>
            <Ionicons name={selectedType ? "arrow-back" : "close"} size={28} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedType ? topics.find(t => t.id === selectedType)?.title : "Вибір теми"}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {!selectedType ? (

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
            {topics.map((topic, index) => (
              <Animated.View key={topic.id} entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity onPress={() => startQuiz(topic.id)} activeOpacity={0.8}>
                  <BlurView intensity={15} tint="light" style={styles.topicCard}>
                    <View style={[styles.iconCircle, { backgroundColor: `${topic.color}20` }]}>
                      <Ionicons name={topic.icon as any} size={24} color={topic.color} />
                    </View>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <Text style={styles.topicDesc}>{topic.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        ) : !isFinished ? (

          <Animated.View entering={FadeIn} style={styles.quizContent}>
            <View style={styles.progressRow}>
                <Text style={styles.progressText}>Питання {currentIndex + 1} з {quizData.length}</Text>
            </View>
            
            <BlurView intensity={25} tint="light" style={styles.questionCard}>
              <Text style={styles.questionText}>{quizData[currentIndex].question}</Text>
            </BlurView>

            <View style={styles.optionsGrid}>
              {quizData[currentIndex].options.map((opt: string, i: number) => (
                <TouchableOpacity key={i} onPress={() => handleAnswer(opt)} style={styles.optionWrapper}>
                  <BlurView intensity={10} tint="light" style={styles.optionBtn}>
                    <Text style={styles.optionText}>{opt}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.feedbackBox}>
              {feedback.status && (
                <Text style={[styles.feedbackText, feedback.status === 'correct' ? styles.correct : styles.wrong]}>
                  {feedback.msg}
                </Text>
              )}
            </View>
          </Animated.View>
        ) : (

          <View style={styles.finalCard}>
            <Text style={styles.finalEmoji}>🎉</Text>
            <Text style={styles.finalTitle}>Чудово!</Text>
            <Text style={styles.finalScore}>Твій результат: {score}/{quizData.length}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => setSelectedType(null)}>
              <Text style={styles.retryBtnText}>До інших тем</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: '#F8FAF8', fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  menuList: { gap: 12, paddingBottom: 40 },
  topicCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  iconCircle: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  topicInfo: { flex: 1 },
  topicTitle: { color: '#F8FAF8', fontSize: 18, fontWeight: '700' },
  topicDesc: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  quizContent: { flex: 1 },
  progressRow: { marginBottom: 20, alignItems: 'center' },
  progressText: { color: '#38BDF8', fontWeight: 'bold' },
  questionCard: { padding: 40, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', alignItems: 'center', marginBottom: 30 },
  questionText: { color: '#F8FAF8', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  optionsGrid: { gap: 12 },
  optionWrapper: { borderRadius: 18, overflow: 'hidden' },
  optionBtn: { padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  optionText: { color: '#F8FAF8', fontSize: 18, fontWeight: '600' },
  feedbackBox: { height: 80, justifyContent: 'center', alignItems: 'center' },
  feedbackText: { fontSize: 20, fontWeight: 'bold' },
  correct: { color: '#22C55E' },
  wrong: { color: '#EF4444' },
  finalCard: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  finalEmoji: { fontSize: 80, marginBottom: 20 },
  finalTitle: { color: '#F8FAF8', fontSize: 32, fontWeight: '900' },
  finalScore: { color: '#94A3B8', fontSize: 18, marginTop: 10, marginBottom: 40 },
  retryBtn: { backgroundColor: '#38BDF8', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20 },
  retryBtnText: { color: '#0F172A', fontWeight: '900' }
});