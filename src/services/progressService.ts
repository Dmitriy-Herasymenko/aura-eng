import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключі для зберігання
const PROGRESS_KEY = 'user_progress';

export interface UserProgress {
  totalPoints: number;
  completedQuizzes: string[];
  learnedWordsCount: number;
  streak: number;
  lastActiveDate: string | null;
}

export const progressService = {

  getProgress: async (): Promise<UserProgress> => {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {
      totalPoints: 0,
      completedQuizzes: [],
      learnedWordsCount: 0,
      streak: 0,
      lastActiveDate: null
    };
  },


  addQuizResult: async (quizId: string, points: number) => {
    const progress = await progressService.getProgress();
    
    if (!progress.completedQuizzes.includes(quizId)) {
      progress.completedQuizzes.push(quizId);
    }
    
    progress.totalPoints += points;
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  },


  updateWordsCount: async (count: number) => {
    const progress = await progressService.getProgress();
    progress.learnedWordsCount = count;
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
};