import { create } from 'zustand';

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

interface SessionData {
  nickname: string;
  selectedCategory: Category | null;
  selectedTopic: Topic | null;
  selectedQuestion: string;
  selectedReader: Reader | null;
  currentStep: number;
  sessionId: string | null;
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

  createSession: () => Promise<void>;
  submitSessionData: () => Promise<void>;
  clearSession: () => void;
  restoreFromStorage: () => void;
}

const STORAGE_KEY = 'tarot_session_data';

const saveToSessionStorage = (data: SessionData) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to sessionStorage:', error);
  }
};

const loadFromSessionStorage = (): Partial<SessionData> | null => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load from sessionStorage:', error);
    return null;
  }
};

const clearSessionStorage = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }
};

const initialState: SessionData = {
  nickname: '',
  selectedCategory: null,
  selectedTopic: null,
  selectedQuestion: '',
  selectedReader: null,
  currentStep: 1,
  sessionId: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,
  isSessionConfirmed: false,

  setNickname: (nickname) => {
    const state = { ...get(), nickname };
    set({ nickname });
    saveToSessionStorage(state);
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
    saveToSessionStorage(state);
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
    saveToSessionStorage(state);
  },

  setSelectedQuestion: (selectedQuestion) => {
    const state = { ...get(), selectedQuestion };
    set({ selectedQuestion });
    saveToSessionStorage(state);
  },

  setSelectedReader: (selectedReader) => {
    const state = { ...get(), selectedReader };
    set({ selectedReader });
    saveToSessionStorage(state);
  },

  setCurrentStep: (currentStep) => {
    const state = { ...get(), currentStep };
    set({ currentStep });
    saveToSessionStorage(state);
  },

  setSessionId: (sessionId) => {
    const state = { ...get(), sessionId };
    const isSessionConfirmed = !!sessionId;
    set({ sessionId, isSessionConfirmed });
    saveToSessionStorage(state);
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

  clearSession: () => {
    set({
      ...initialState,
      isSessionConfirmed: false,
    });
    clearSessionStorage();
  },

  restoreFromStorage: () => {
    const saved = loadFromSessionStorage();
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
        isSessionConfirmed,
      });
    }
  },
}));