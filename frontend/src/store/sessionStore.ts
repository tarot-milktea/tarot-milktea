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
  videoUrl: string;
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
    set((state) => {
      const newState = { ...state, nickname };
      storageService.saveSessionData(newState);
      return { nickname };
    });
  },

  setSelectedCategory: (selectedCategory) => {
    set((state) => {
      const newState = {
        ...state,
        selectedCategory,
        selectedTopic: null,
        selectedQuestion: ''
      };
      storageService.saveSessionData(newState);
      return {
        selectedCategory,
        selectedTopic: null,
        selectedQuestion: ''
      };
    });
  },

  setSelectedTopic: (selectedTopic) => {
    set((state) => {
      const newState = {
        ...state,
        selectedTopic,
        selectedQuestion: ''
      };
      storageService.saveSessionData(newState);
      return {
        selectedTopic,
        selectedQuestion: ''
      };
    });
  },

  setSelectedQuestion: (selectedQuestion) => {
    set((state) => {
      const newState = { ...state, selectedQuestion };
      storageService.saveSessionData(newState);
      return { selectedQuestion };
    });
  },

  setSelectedReader: (selectedReader) => {
    set((state) => {
      const newState = { ...state, selectedReader };
      storageService.saveSessionData(newState);
      return { selectedReader };
    });
  },


  setSessionId: (sessionId) => {
    set((state) => {
      const isSessionConfirmed = !!sessionId;
      const newState = { ...state, sessionId };
      storageService.saveSessionData(newState);
      return { sessionId, isSessionConfirmed };
    });
  },

  setPredefinedCards: (predefinedCards) => {
    set((state) => {
      const newState = { ...state, predefinedCards };
      storageService.saveSessionData(newState);
      return { predefinedCards };
    });
  },

  createSession: async () => {
    const { nickname } = get();

    try {
      const response = await tarotApiService.createSessionWithCards(nickname);
      const { sessionId, predefinedCards } = response;

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
      const current = get();
      const isSessionConfirmed = !!(current.sessionId || saved.sessionId);

      const restoredState = {
        nickname: saved.nickname || '',
        selectedCategory: saved.selectedCategory || null,
        selectedTopic: saved.selectedTopic || null,
        selectedQuestion: saved.selectedQuestion || '',
        selectedReader: saved.selectedReader || null,
        sessionId: current.sessionId || saved.sessionId || null,
        predefinedCards: saved.predefinedCards || [],
        isSessionConfirmed,
      };

      set(restoredState);
    }
  },
}));