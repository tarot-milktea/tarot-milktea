import { create } from 'zustand';

interface Category {
  code: string;
  name: string;
  description: string;
  topics: Topic[];
}

interface Topic {
  code: string;
  name: string;
  description: string;
  sampleQuestions: string[];
}

interface Reader {
  type: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface DataState {
  categories: Category[];
  readers: Reader[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  fetchReaders: () => Promise<void>;
  initializeData: () => Promise<void>;
  clearError: () => void;
}

const API_BASE_URL = 'https://j13a601.p.ssafy.io/api';

export const useDataStore = create<DataState>((set, get) => ({
  categories: [],
  readers: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch(`${API_BASE_URL}/topics`);

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      set({ categories: data.categories || [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  fetchReaders: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch(`${API_BASE_URL}/readers`);

      if (!response.ok) {
        throw new Error(`Failed to fetch readers: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      set({ readers: data.readers || [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  initializeData: async () => {
    const { categories, readers, isLoading } = get();

    // 이미 로딩 중이거나 데이터가 있으면 중복 호출 방지
    if (isLoading || (categories.length > 0 && readers.length > 0)) {
      return;
    }

    try {
      set({ isLoading: true, error: null });

      await Promise.all([
        get().fetchCategories(),
        get().fetchReaders()
      ]);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize data',
        isLoading: false
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));