import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { tarotApiService } from '../services/apiService';

export interface Category {
  code: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Topic {
  code: string;
  name: string;
  description: string;
  sampleQuestions: string[];
}

export interface Reader {
  type: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface PredefinedCard {
  position: number;
  cardId: number;
  nameKo: string;
  nameEn: string;
  orientation: 'upright' | 'reversed';
  videoUrl: string;
}

interface SessionData {
  nickname: string;
  selectedCategory: Category | null;
  selectedTopic: Topic | null;
  selectedQuestion: string;
  selectedReader: Reader | null;
  sessionId: string | null;
  predefinedCards: PredefinedCard[];
}

interface SessionState extends SessionData {
  isSessionConfirmed: boolean;

  setNickname: (nickname: string) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedTopic: (topic: Topic | null) => void;
  setSelectedQuestion: (question: string) => void;
  setSelectedReader: (reader: Reader | null) => void;
  setSessionId: (sessionId: string | null) => void;
  setPredefinedCards: (cards: PredefinedCard[]) => void;

  createSession: () => Promise<string>;
  submitSessionData: () => Promise<unknown>;
  fetchPredefinedCards: () => Promise<PredefinedCard[]>;
  clearSession: () => void;
  restoreFromStorage: () => void;
}

const initialState: SessionData = {
  nickname: '',
  selectedCategory: null,
  selectedTopic: null,
  selectedQuestion: '',
  selectedReader: null,
  sessionId: null,
  predefinedCards: [],
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,
  isSessionConfirmed: false,

  setNickname: (nickname) => {
    const state = { ...get(), nickname };
    set({ nickname });
    storageService.saveSessionData(state);
  },

  setSelectedCategory: (selectedCategory) => {
    const state = {
      ...get(),
      selectedCategory,
      selectedTopic: null,
      selectedQuestion: ''
    };
    set({
      selectedCategory,
      selectedTopic: null,
      selectedQuestion: ''
    });
    storageService.saveSessionData(state);
  },

  setSelectedTopic: (selectedTopic) => {
    const state = {
      ...get(),
      selectedTopic,
      selectedQuestion: ''
    };
    set({
      selectedTopic,
      selectedQuestion: ''
    });
    storageService.saveSessionData(state);
  },

  setSelectedQuestion: (selectedQuestion) => {
    const state = { ...get(), selectedQuestion };
    set({ selectedQuestion });
    storageService.saveSessionData(state);
  },

  setSelectedReader: (selectedReader) => {
    const state = { ...get(), selectedReader };
    set({ selectedReader });
    storageService.saveSessionData(state);
  },


  setSessionId: (sessionId) => {
    const state = { ...get(), sessionId };
    const isSessionConfirmed = !!sessionId;
    set({ sessionId, isSessionConfirmed });
    storageService.saveSessionData(state);
  },

  setPredefinedCards: (predefinedCards) => {
    const state = { ...get(), predefinedCards };
    set({ predefinedCards });
    storageService.saveSessionData(state);
  },

  createSession: async () => {
    const { nickname } = get();

    try {
      const { sessionId, predefinedCards } = await tarotApiService.createSessionWithCards(nickname);

      // 상태 업데이트
      get().setSessionId(sessionId);
      get().setPredefinedCards(predefinedCards);

      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  submitSessionData: async () => {
    const {
      sessionId,
      selectedCategory,
      selectedTopic,
      selectedQuestion,
      selectedReader
    } = get();

    if (!sessionId || !selectedCategory || !selectedTopic || !selectedReader) {
      throw new Error('Missing required session data');
    }

    try {
      const result = await tarotApiService.submitSessionData(sessionId, {
        categoryCode: selectedCategory.code,
        topicCode: selectedTopic.code,
        questionText: selectedQuestion,
        readerType: selectedReader.type
      });

      return result;
    } catch (error) {
      console.error('❌ 세션 데이터 제출 실패:', error);
      throw error;
    }
  },

  fetchPredefinedCards: async () => {
    const { sessionId } = get();

    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      const cards = await tarotApiService.getPredefinedCards(sessionId);

      get().setPredefinedCards(cards);
      return cards;
    } catch (error) {
      console.error('Error fetching predefined cards:', error);
      throw error;
    }
  },

  clearSession: () => {
    set({
      ...initialState,
      isSessionConfirmed: false,
    });
    storageService.clearSessionData();
  },

  restoreFromStorage: () => {
    const saved = storageService.loadSessionData();
    if (saved) {
      const isSessionConfirmed = !!saved.sessionId;
      set({
        nickname: saved.nickname || '',
        selectedCategory: saved.selectedCategory || null,
        selectedTopic: saved.selectedTopic || null,
        selectedQuestion: saved.selectedQuestion || '',
        selectedReader: saved.selectedReader || null,
        sessionId: saved.sessionId || null,
        predefinedCards: saved.predefinedCards || [],
        isSessionConfirmed,
      });
    }
  },
}));