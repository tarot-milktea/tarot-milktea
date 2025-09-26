import { create } from 'zustand';

export type CardType = 'past' | 'present' | 'future';
export type ProcessingStatus =
  | 'CREATED' | 'CARDS_GENERATED' | 'SUBMITTED'
  | 'PAST_PROCESSING' | 'PAST_COMPLETED'
  | 'PRESENT_PROCESSING' | 'PRESENT_COMPLETED'
  | 'FUTURE_PROCESSING' | 'FUTURE_COMPLETED'
  | 'SUMMARY_PROCESSING' | 'SUMMARY_COMPLETED'
  | 'IMAGE_PROCESSING' | 'COMPLETED' | 'FAILED';

interface CardInterpretation {
  interpretation: string;
  receivedAt: Date;
  isComplete: boolean;
}

interface ProcessingStatusInfo {
  status: ProcessingStatus;
  message: string;
  progress: number;
  updatedAt: Date;
}

interface ResultState {
  // SSE Connection State
  sessionId: string | null;
  nickname: string | null;
  isProcessing: boolean;
  processingStatus: ProcessingStatusInfo | null;
  error: string | null;

  // Card Interpretations
  cardInterpretations: {
    past: CardInterpretation | null;
    present: CardInterpretation | null;
    future: CardInterpretation | null;
  };

  // Summary and Overall Result
  summary: string | null;
  summaryReceivedAt: Date | null;
  fortuneScore: number | null;

  // Advice Image
  adviceImageUrl: string | null;
  adviceImageText: string | null;
  imageReceivedAt: Date | null;

  // Carousel State
  currentSlide: number;
  availableSlides: number;
  autoProgressEnabled: boolean;

  // Actions
  setSessionId: (sessionId: string) => void;
  setNickname: (nickname: string) => void;
  setProcessingStatus: (status: ProcessingStatus, message: string, progress: number) => void;
  setCardInterpretation: (cardType: CardType, interpretation: string) => void;
  setSummary: (summary: string, score?: number) => void;
  setAdviceImage: (imageUrl: string, imageText?: string) => void;
  setCurrentSlide: (slide: number) => void;
  setAutoProgressEnabled: (enabled: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  resetResult: () => void;

  // Computed getters
  getAvailableSlides: () => number;
  getCompletionPercentage: () => number;
  isSlideAvailable: (slideIndex: number) => boolean;
  shouldAutoProgress: () => boolean;
}

const initialState = {
  sessionId: null,
  nickname: null,
  isProcessing: false,
  processingStatus: null,
  error: null,
  cardInterpretations: {
    past: null,
    present: null,
    future: null,
  },
  summary: null,
  summaryReceivedAt: null,
  fortuneScore: null,
  adviceImageUrl: null,
  adviceImageText: null,
  imageReceivedAt: null,
  currentSlide: 0,
  availableSlides: 0,
  autoProgressEnabled: true,
};

export const useResultStore = create<ResultState>((set, get) => ({
  ...initialState,

  setSessionId: (sessionId: string) => {
    set({ sessionId, isProcessing: true });
  },

  setNickname: (nickname: string) => {
    set({ nickname });
  },

  setProcessingStatus: (status: ProcessingStatus, message: string, progress: number) => {
    const processingStatus: ProcessingStatusInfo = {
      status,
      message,
      progress,
      updatedAt: new Date(),
    };

    set({
      processingStatus,
      isProcessing: status !== 'COMPLETED' && status !== 'FAILED',
      error: status === 'FAILED' ? message : null
    });
  },

  setCardInterpretation: (cardType: CardType, interpretation: string) => {
    const state = get();
    const newInterpretation: CardInterpretation = {
      interpretation,
      receivedAt: new Date(),
      isComplete: true,
    };

    const updatedInterpretations = {
      ...state.cardInterpretations,
      [cardType]: newInterpretation,
    };

    // Calculate new available slides
    const availableSlides = get().getAvailableSlides();

    set({
      cardInterpretations: updatedInterpretations,
      availableSlides,
    });

    // Auto-progress to new slide if enabled and user hasn't moved manually
    const shouldProgress = get().shouldAutoProgress();
    if (shouldProgress && state.autoProgressEnabled) {
      const newSlideIndex = Math.min(availableSlides - 1, state.currentSlide + 1);
      set({ currentSlide: newSlideIndex });
    }
  },

  setSummary: (summary: string, score?: number) => {
    const availableSlides = get().getAvailableSlides();

    set({
      summary,
      summaryReceivedAt: new Date(),
      fortuneScore: score ?? null,
      availableSlides,
    });

    // Auto-progress to summary slide
    const state = get();
    if (state.autoProgressEnabled && get().shouldAutoProgress()) {
      const summarySlideIndex = 3; // Past, Present, Future, Summary
      set({ currentSlide: summarySlideIndex });
    }
  },

  setAdviceImage: (imageUrl: string, imageText?: string) => {
    const availableSlides = get().getAvailableSlides();

    set({
      adviceImageUrl: imageUrl,
      adviceImageText: imageText ?? null,
      imageReceivedAt: new Date(),
      availableSlides,
    });

    // Auto-progress to final slide
    const state = get();
    if (state.autoProgressEnabled && get().shouldAutoProgress()) {
      const finalSlideIndex = 4; // Past, Present, Future, Summary, Image
      set({ currentSlide: finalSlideIndex });
    }
  },

  setCurrentSlide: (slide: number) => {
    const state = get();
    const maxSlide = state.availableSlides - 1;
    const validSlide = Math.max(0, Math.min(slide, maxSlide));

    set({
      currentSlide: validSlide,
      // Disable auto-progress if user manually navigates
      autoProgressEnabled: false,
    });
  },

  setAutoProgressEnabled: (enabled: boolean) => {
    set({ autoProgressEnabled: enabled });
  },

  setError: (error: string) => {
    set({ error, isProcessing: false });
  },

  clearError: () => {
    set({ error: null });
  },

  resetResult: () => {
    set(initialState);
  },

  // Computed getters
  getAvailableSlides: () => {
    const state = get();
    let slides = 0;

    // Card interpretation slides (0, 1, 2)
    if (state.cardInterpretations.past?.isComplete) slides = 1;
    if (state.cardInterpretations.present?.isComplete) slides = 2;
    if (state.cardInterpretations.future?.isComplete) slides = 3;

    // Summary slide (3)
    if (state.summary) slides = 4;

    // Advice image slide (4)
    if (state.adviceImageUrl) slides = 5;

    return slides;
  },

  getCompletionPercentage: () => {
    const state = get();
    if (!state.processingStatus) return 0;

    return Math.min(100, Math.max(0, state.processingStatus.progress));
  },

  isSlideAvailable: (slideIndex: number) => {
    const availableSlides = get().getAvailableSlides();
    return slideIndex < availableSlides;
  },

  shouldAutoProgress: () => {
    const state = get();
    return state.autoProgressEnabled && state.isProcessing;
  },
}));