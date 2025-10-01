import { create } from 'zustand';
import { tarotApiService } from '../services/apiService';

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
  videoUrl: string;
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


export const useDataStore = create<DataState>((set, get) => ({
  categories: [],
  readers: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });

      const categories = await tarotApiService.getTopics();

      set({ categories, isLoading: false });
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

      const readers = await tarotApiService.getReaders();

      set({ readers, isLoading: false });
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

      const { categories: newCategories, readers: newReaders } = await tarotApiService.initializeAppData();

      set({
        categories: newCategories,
        readers: newReaders,
        isLoading: false
      });
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