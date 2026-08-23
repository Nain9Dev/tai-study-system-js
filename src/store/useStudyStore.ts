import { create } from 'zustand';
import type { Pregunta } from '../types/domain';
import { preguntasApi } from '../api/endpoints/preguntas';
import { apiClient } from '../api/client';

export type StudyMode = 'exam' | 'study';

interface StudyState {
  mode: StudyMode;
  questions: Pregunta[];
  currentQuestionIndex: number;
  selectedAnswers: Record<number, number>; // questionId -> selectedOptionIndex
  isTestActive: boolean;
  isTestFinished: boolean;
  isLoading: boolean;
  error: string | null;
  isOfflineMode: boolean;

  setMode: (mode: StudyMode) => void;
  fetchPreguntas: (bloque?: string) => Promise<void>;
  answerQuestion: (questionId: number, answerIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishTest: () => void;
  resetTest: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  mode: 'exam',
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswers: {},
  isTestActive: false,
  isTestFinished: false,
  isLoading: false,
  error: null,
  isOfflineMode: false,

  setMode: (mode) => set({ mode }),

  fetchPreguntas: async (bloque?: string) => {
    set({ isLoading: true, error: null, isTestActive: false, isTestFinished: false });
    try {
      const data = bloque && bloque !== 'all'
        ? await preguntasApi.getPreguntasByBloque(bloque)
        : await preguntasApi.getPreguntas();
      
      const offline = apiClient.getMode() === 'static';
      set({ questions: data, isLoading: false, isTestActive: true, isOfflineMode: offline });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Error al cargar las preguntas', isTestActive: false });
    }
  },

  answerQuestion: (questionId, answerIndex) => set((state) => ({
    selectedAnswers: { ...state.selectedAnswers, [questionId]: answerIndex }
  })),

  nextQuestion: () => set((state) => ({
    currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
  })),

  prevQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
  })),

  finishTest: () => set({ isTestFinished: true, isTestActive: false }),

  resetTest: () => set({
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswers: {},
    isTestActive: false,
    isTestFinished: false,
    error: null
  }),
}));
