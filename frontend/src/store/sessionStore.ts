import { create } from 'zustand';
import { storageService } from '../services/storageService';

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
  currentStep: number;
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
  setCurrentStep: (step: number) => void;
  setSessionId: (sessionId: string | null) => void;
  setPredefinedCards: (cards: PredefinedCard[]) => void;

  createSession: () => Promise<void>;
  submitSessionData: () => Promise<void>;
  fetchPredefinedCards: () => Promise<void>;
  clearSession: () => void;
  restoreFromStorage: () => void;
}

const initialState: SessionData = {
  nickname: '',
  selectedCategory: null,
  selectedTopic: null,
  selectedQuestion: '',
  selectedReader: null,
  currentStep: 1,
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

  setCurrentStep: (currentStep) => {
    const state = { ...get(), currentStep };
    set({ currentStep });
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
      const response = await fetch('https://j13a601.p.ssafy.io/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      get().setSessionId(data.sessionId);

      // 세션 생성 후 미리 정해진 카드들 가져오기
      await get().fetchPredefinedCards();

      return data.sessionId;
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
      const response = await fetch(`https://j13a601.p.ssafy.io/api/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryCode: selectedCategory.code,
          topicCode: selectedTopic.code,
          questionText: selectedQuestion,
          readerType: selectedReader.type,
          selectedCards: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit session data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting session data:', error);
      throw error;
    }
  },

  fetchPredefinedCards: async () => {
    const { sessionId } = get();

    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      const response = await fetch(`https://j13a601.p.ssafy.io/api/sessions/${sessionId}/cards`);

      if (!response.ok) {
        throw new Error('Failed to fetch predefined cards');
      }

      const data = await response.json();
      get().setPredefinedCards(data.cards || []);

      return data.cards;
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
        currentStep: saved.currentStep || 1,
        sessionId: saved.sessionId || null,
        predefinedCards: saved.predefinedCards || [],
        isSessionConfirmed,
      });
    }
  },
}));