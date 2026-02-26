import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { AuraBackground } from '@/src/components/AuraBackground';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { toBeQuiz, pronounsQuiz, articlesQuiz, presentSimpleQuiz } from '@/src/data/dataQuiz';
import { progressService } from '@/src/services/progressService';

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
  
  // Зберігаємо історію відповідей для аналізу помилок
  const [wrongAnswers, setWrongAnswers] = useState<{question: string, correctAnswer: string}[]>([]);

  // Зберігаємо прогрес тільки при завершенні з хорошим результатом
  useEffect(() => {
    if (isFinished && selectedType) {
      const percentage = (score / quizData.length) * 100;
      
      if (percentage >= 90) {
        const saveResults = async () => {
          const earnedXP = 100 + (score * 10); // Більше XP за квіз
          await progressService.addQuizResult(selectedType, earnedXP);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        };
        saveResults();
      }
    }
  }, [isFinished]);

  const startQuiz = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const data = allQuizzes[type] || [];
    setQuizData([...data].sort(() => Math.random() - 0.5));
    setSelectedType(type);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setWrongAnswers([]);
  };

  const handleAnswer = (option: string) => {
    if (feedback.status) return;
    const currentQ = quizData[currentIndex];
    
    if (option === currentQ.answer) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFeedback({status: 'correct', msg: '✨ Чудово!'});
      setScore(s => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback({status: 'wrong', msg: '❌ Ой...'});
      // Додаємо в список помилок
      setWrongAnswers(prev => [...prev, {
        question: currentQ.question,
        correctAnswer: currentQ.answer
      }]);
    }

    setTimeout(() => {
      setFeedback({status: null, msg: ''});
      if (currentIndex < quizData.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setIsFinished(true);
      }
    }, 800);
  };

  const percentage = Math.round((score / quizData.length) * 100);

  return (
    <AuraBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => selectedType ? setSelectedType(null) : router.back()}>
            <Ionicons name={selectedType ? "arrow-back" : "close"} size={28} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedType ? topics.find(t => t.id === selectedType)?.title : "English Quiz"}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {!selectedType ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
            <Text style={styles.sectionTitle}>Обери тему для тесту:</Text>
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
          <View style={styles.quizContent}>
            <View style={styles.progressRow}>
                <Text style={styles.progressText}>Прогрес: {currentIndex + 1} / {quizData.length}</Text>
                <View style={styles.progressBarBg}>
                   <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / quizData.length) * 100}%` }]} />
                </View>
            </View>
            
            <BlurView intensity={25} tint="light" style={styles.questionCard}>
              <Text style={styles.questionText}>{quizData[currentIndex].question}</Text>
            </BlurView>

            <View style={styles.optionsGrid}>
              {quizData[currentIndex].options.map((opt: string, i: number) => (
                <TouchableOpacity key={i} onPress={() => handleAnswer(opt)} style={styles.optionWrapper} disabled={!!feedback.status}>
                  <BlurView intensity={feedback.status ? 5 : 15} tint="light" style={styles.optionBtn}>
                    <Text style={styles.optionText}>{opt}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.feedbackBox}>
              {feedback.status && (
                <Animated.Text entering={FadeIn} style={[styles.feedbackText, feedback.status === 'correct' ? styles.correct : styles.wrong]}>
                  {feedback.msg}
                </Animated.Text>
              )}
            </View>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.finalScroll}>
            <Animated.View entering={ZoomIn} style={{ alignItems: 'center' }}>
              <Text style={styles.finalEmoji}>{percentage >= 90 ? "🏆" : "🧐"}</Text>
              <Text style={styles.finalTitle}>{percentage >= 90 ? "Чудовий результат!" : "Треба ще повчити"}</Text>
              <Text style={styles.finalScore}>Точність: {percentage}% ({score}/{quizData.length})</Text>
              
              {percentage >= 90 ? (
                <View style={styles.xpBadge}>
                  <Ionicons name="flash" size={18} color="#FBBF24" />
                  <Text style={styles.xpText}>+{100 + (score * 10)} XP ЗАРОБЛЕНО</Text>
                </View>
              ) : (
                <Text style={styles.warningText}>Мінімум 90% для отримання XP</Text>
              )}

              {wrongAnswers.length > 0 && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorHeader}>Твої помилки:</Text>
                  {wrongAnswers.map((err, idx) => (
                    <View key={idx} style={styles.errorItem}>
                       <Text style={styles.errorQuestion}>{err.question}</Text>
                       <View style={styles.errorAnswerRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                          <Text style={styles.errorCorrectText}>{err.correctAnswer}</Text>
                       </View>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.retryBtn} onPress={() => setSelectedType(null)}>
                <Text style={styles.retryBtnText}>До списку тем</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        )}
      </View>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#F8FAF8', fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 15, marginLeft: 5 },
  menuList: { gap: 12, paddingBottom: 120 },
  topicCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  iconCircle: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  topicInfo: { flex: 1 },
  topicTitle: { color: '#F8FAF8', fontSize: 18, fontWeight: '700' },
  topicDesc: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  quizContent: { flex: 1 },
  progressRow: { marginBottom: 25, width: '100%' },
  progressText: { color: '#38BDF8', fontWeight: '800', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#38BDF8' },
  questionCard: { padding: 40, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', alignItems: 'center', marginBottom: 30 },
  questionText: { color: '#F8FAF8', fontSize: 24, fontWeight: 'bold', textAlign: 'center', lineHeight: 32 },
  optionsGrid: { gap: 12 },
  optionWrapper: { borderRadius: 20, overflow: 'hidden' },
  optionBtn: { padding: 22, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  optionText: { color: '#F8FAF8', fontSize: 18, fontWeight: '700' },
  feedbackBox: { height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  feedbackText: { fontSize: 20, fontWeight: '900' },
  correct: { color: '#22C55E' },
  wrong: { color: '#EF4444' },
  finalScroll: { paddingBottom: 100 },
  finalEmoji: { fontSize: 80, marginBottom: 20 },
  finalTitle: { color: '#F8FAF8', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  finalScore: { color: '#94A3B8', fontSize: 18, marginTop: 10, marginBottom: 20 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 191, 36, 0.15)', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
  xpText: { color: '#FBBF24', fontWeight: '900', marginLeft: 8, fontSize: 14 },
  warningText: { color: '#EF4444', fontWeight: '700', marginBottom: 30 },
  errorContainer: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  errorHeader: { color: '#F8FAF8', fontWeight: '800', marginBottom: 15, fontSize: 16 },
  errorItem: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 10 },
  errorQuestion: { color: '#94A3B8', fontSize: 15, marginBottom: 5 },
  errorAnswerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorCorrectText: { color: '#22C55E', fontWeight: '700', fontSize: 16 },
  retryBtn: { backgroundColor: '#38BDF8', paddingVertical: 18, paddingHorizontal: 50, borderRadius: 22 },
  retryBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16 }
});