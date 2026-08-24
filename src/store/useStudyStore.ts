import { create } from 'zustand';
import type { Pregunta } from '../types/domain';

export type StudyMode = 'exam' | 'study';

interface StudyState {
  mode: StudyMode;
  questions: Pregunta[];
  currentQuestionIndex: number;
  selectedAnswers: Record<number, number>; // questionId -> selectedOptionIndex
  isTestActive: boolean;
  isTestFinished: boolean;
  setMode: (mode: StudyMode) => void;
  startTest: (questions: Pregunta[]) => void;
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

  setMode: (mode) => set({ mode }),

  startTest: (questions) => set({
    questions,
    isTestActive: true,
    isTestFinished: false,
    currentQuestionIndex: 0,
    selectedAnswers: {}
  }),

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
    isTestFinished: false
  }),
}));
