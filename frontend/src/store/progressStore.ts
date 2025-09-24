import { create } from 'zustand';

export type PageStep =
  | 'onboarding-1'
  | 'onboarding-2'
  | 'onboarding-3'
  | 'onboarding-4'
  | 'onboarding-5'
  | 'card-draw'
  | 'loading'
  | 'result';

interface ProgressState {
  currentPage: PageStep;
  setCurrentPage: (page: PageStep) => void;
  getCurrentStep: () => number;
  getTotalSteps: () => number;
  getProgress: () => number;
}

const STEP_MAPPING: Record<PageStep, number> = {
  'onboarding-1': 1,
  'onboarding-2': 2,
  'onboarding-3': 3,
  'onboarding-4': 4,
  'onboarding-5': 5,
  'card-draw': 6,
  'loading': 6, // CardDrawPage와 같은 단계
  'result': 7,
};

const TOTAL_STEPS = 7;

export const useProgressStore = create<ProgressState>((set, get) => ({
  currentPage: 'onboarding-1',

  setCurrentPage: (page: PageStep) => {
    set({ currentPage: page });
  },

  getCurrentStep: () => {
    const { currentPage } = get();
    return STEP_MAPPING[currentPage];
  },

  getTotalSteps: () => TOTAL_STEPS,

  getProgress: () => {
    const currentStep = get().getCurrentStep();
    return Math.min((currentStep / TOTAL_STEPS) * 100, 100);
  },
}));

// 페이지 경로를 기반으로 PageStep을 결정하는 유틸리티 함수
export const getPageStepFromPath = (pathname: string): PageStep => {
  if (pathname === '/' || pathname === '/onboarding/1') return 'onboarding-1';
  if (pathname === '/onboarding/2') return 'onboarding-2';
  if (pathname === '/onboarding/3') return 'onboarding-3';
  if (pathname === '/onboarding/4') return 'onboarding-4';
  if (pathname === '/onboarding/5') return 'onboarding-5';
  if (pathname === '/onboarding/card-draw') return 'card-draw';
  if (pathname === '/onboarding/loading') return 'loading';
  if (pathname.startsWith('/result/')) return 'result';

  // 기본값
  return 'onboarding-1';
};