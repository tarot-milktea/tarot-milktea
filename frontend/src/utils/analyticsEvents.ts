/**
 * Analytics Events 정의 파일
 *
 * 모든 GA 이벤트를 중앙에서 관리하여 일관성을 보장하고
 * 이벤트 이름 변경 시 한 곳에서만 수정하도록 함
 */

// 페이지 이름 상수
export const PAGE_NAMES = {
  ONBOARDING_1: 'onboarding_1',
  ONBOARDING_2: 'onboarding_2',
  ONBOARDING_3: 'onboarding_3',
  ONBOARDING_4: 'onboarding_4',
  ONBOARDING_5: 'onboarding_5',
  CARD_DRAW: 'card_draw',
  LOADING: 'loading',
  RESULT: 'result_page'
} as const;

// 온보딩 단계 정보
export const ONBOARDING_STEPS = {
  1: { name: 'nickname_input', title: '닉네임 입력' },
  2: { name: 'category_selection', title: '카테고리 선택' },
  3: { name: 'topic_selection', title: '주제 선택' },
  4: { name: 'question_input', title: '질문 입력' },
  5: { name: 'reader_selection', title: '리더 선택' }
} as const;

// 사용자 선택 타입
export const SELECTION_TYPES = {
  CATEGORY: 'category',
  TOPIC: 'topic',
  QUESTION: 'question',
  READER: 'reader',
  CARD: 'card',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  MODAL_OPEN: 'modal_open'
} as const;

// 카드 이벤트 액션
export const CARD_ACTIONS = {
  SELECT: 'select',
  REVEAL: 'reveal',
  COMPLETE: 'complete'
} as const;

// 결과 페이지 액션
export const RESULT_ACTIONS = {
  VIEW_COMPLETE: 'view_complete',
  SHARE: 'share',
  RESTART: 'restart'
} as const;

// 공유 방법
export const SHARE_METHODS = {
  NATIVE: 'native',
  CLIPBOARD: 'clipboard'
} as const;

// 에러 타입
export const ERROR_TYPES = {
  API_ERROR: 'api_error',
  COMPONENT_ERROR: 'component_error',
  NETWORK_ERROR: 'network_error',
  SHARE_ERROR: 'share_failed',
  VALIDATION_ERROR: 'validation_error'
} as const;

// 성능 지표 타입
export const PERFORMANCE_METRICS = {
  LOAD_TIME: 'load_time',
  INTERACTION_TIME: 'interaction_time',
  API_RESPONSE_TIME: 'api_response_time',
  IMAGE_LOAD_TIME: 'image_load_time'
} as const;

// 이벤트 카테고리
export const EVENT_CATEGORIES = {
  ONBOARDING: 'onboarding',
  USER_CHOICE: 'user_choice',
  TAROT_CARDS: 'tarot_cards',
  RESULT_PAGE: 'result_page',
  PERFORMANCE: 'performance',
  ERRORS: 'errors',
  ENGAGEMENT: 'engagement'
} as const;

// 페이지별 제목 매핑
export const PAGE_TITLES = {
  [PAGE_NAMES.ONBOARDING_1]: '온보딩 1단계 - 닉네임',
  [PAGE_NAMES.ONBOARDING_2]: '온보딩 2단계 - 카테고리',
  [PAGE_NAMES.ONBOARDING_3]: '온보딩 3단계 - 주제',
  [PAGE_NAMES.ONBOARDING_4]: '온보딩 4단계 - 질문',
  [PAGE_NAMES.ONBOARDING_5]: '온보딩 5단계 - 리더',
  [PAGE_NAMES.CARD_DRAW]: '카드 뽑기',
  [PAGE_NAMES.LOADING]: '결과 생성 중',
  [PAGE_NAMES.RESULT]: '타로 결과'
} as const;

// 타입 정의
export type PageName = typeof PAGE_NAMES[keyof typeof PAGE_NAMES];
export type OnboardingStepNumber = keyof typeof ONBOARDING_STEPS;
export type SelectionType = typeof SELECTION_TYPES[keyof typeof SELECTION_TYPES];
export type CardAction = typeof CARD_ACTIONS[keyof typeof CARD_ACTIONS];
export type ResultAction = typeof RESULT_ACTIONS[keyof typeof RESULT_ACTIONS];
export type ShareMethod = typeof SHARE_METHODS[keyof typeof SHARE_METHODS];
export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];
export type PerformanceMetric = typeof PERFORMANCE_METRICS[keyof typeof PERFORMANCE_METRICS];
export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];

// 이벤트 매개변수 타입 정의
export interface OnboardingEventParams {
  step_number: number;
  step_name: string;
  category: typeof EVENT_CATEGORIES.ONBOARDING;
  [key: string]: string | number | boolean;
}

export interface UserSelectionEventParams {
  selection_type: SelectionType;
  selection_value: string;
  category: typeof EVENT_CATEGORIES.USER_CHOICE;
  step_number?: number;
}

export interface CardEventParams {
  category: typeof EVENT_CATEGORIES.TAROT_CARDS;
  card_id?: number;
  card_position?: string;
  selected_cards?: string;
  cards_count?: number;
}

export interface ResultEventParams {
  category: typeof EVENT_CATEGORIES.RESULT_PAGE;
  result_id?: string;
  share_method?: ShareMethod;
}

export interface PerformanceEventParams {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  category: typeof EVENT_CATEGORIES.PERFORMANCE;
}

export interface ErrorEventParams {
  error_type: ErrorType;
  error_message: string;
  category: typeof EVENT_CATEGORIES.ERRORS;
  error_location?: string;
}

export interface EngagementEventParams {
  page_name: PageName;
  time_spent: number;
  category: typeof EVENT_CATEGORIES.ENGAGEMENT;
}

// 헬퍼 함수들
export const getOnboardingStepInfo = (step: number) => {
  return ONBOARDING_STEPS[step as OnboardingStepNumber];
};

export const getPageTitle = (pageName: PageName) => {
  return PAGE_TITLES[pageName];
};

export const createOnboardingEventParams = (
  step: number,
  additionalData?: Record<string, string | number | boolean>
): OnboardingEventParams => {
  const stepInfo = getOnboardingStepInfo(step);
  return {
    step_number: step,
    step_name: stepInfo?.name || `step_${step}`,
    category: EVENT_CATEGORIES.ONBOARDING,
    ...additionalData
  };
};

export const createUserSelectionEventParams = (
  selectionType: SelectionType,
  value: string,
  step?: number
): UserSelectionEventParams => {
  return {
    selection_type: selectionType,
    selection_value: value,
    category: EVENT_CATEGORIES.USER_CHOICE,
    ...(step !== undefined && { step_number: step })
  };
};

export const createCardEventParams = (
  additionalData?: Partial<CardEventParams>
): CardEventParams => {
  return {
    category: EVENT_CATEGORIES.TAROT_CARDS,
    ...additionalData
  };
};

export const createResultEventParams = (
  resultId?: string,
  additionalData?: Partial<ResultEventParams>
): ResultEventParams => {
  return {
    category: EVENT_CATEGORIES.RESULT_PAGE,
    ...(resultId && { result_id: resultId }),
    ...additionalData
  };
};