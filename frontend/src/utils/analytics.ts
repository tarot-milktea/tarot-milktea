import ReactGA from 'react-ga4';

// GA 측정 ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GA_ENABLE_DEV = import.meta.env.VITE_GA_ENABLE_DEV === 'true';

// 개발 환경에서 GA 사용 여부 확인
const isProduction = import.meta.env.PROD;
const shouldInitializeGA = isProduction || GA_ENABLE_DEV;

/**
 * Google Analytics 초기화
 */
export const initializeGA = () => {
  if (!GA_MEASUREMENT_ID) {
    if (isProduction) {
      console.warn('GA 측정 ID가 설정되지 않았습니다.');
    }
    return;
  }

  if (!shouldInitializeGA) {
    return;
  }

  try {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      testMode: !isProduction, // 개발 환경에서는 테스트 모드 활성화
    });

    if (isProduction) {
      // console.log('Google Analytics 초기화 완료:', GA_MEASUREMENT_ID);
    }
  } catch (error) {
    console.error('GA 초기화 실패:', error);
  }
};

/**
 * 페이지뷰 추적
 */
export const trackPageView = (path: string, title?: string) => {
  if (!shouldInitializeGA) return;

  try {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title || document.title
    });

    if (!isProduction) {
      // console.log('페이지뷰 추적:', path);
    }
  } catch (error) {
    console.error('페이지뷰 추적 실패:', error);
  }
};

/**
 * 커스텀 이벤트 추적
 */
export const trackEvent = (
  action: string,
  parameters?: Record<string, string | number | boolean>
) => {
  if (!shouldInitializeGA) return;

  try {
    ReactGA.event(action, parameters);

    if (!isProduction) {
      // console.log('이벤트 추적:', action, parameters);
    }
  } catch (error) {
    console.error('이벤트 추적 실패:', error);
  }
};

// 타로 서비스 전용 이벤트 추적 함수들

/**
 * 온보딩 단계 진입 추적
 */
export const trackOnboardingEnter = (step: number, stepName: string) => {
  trackEvent('onboarding_enter', {
    step_number: step,
    step_name: stepName,
    category: 'onboarding'
  });
};

/**
 * 온보딩 단계 완료 추적
 */
export const trackOnboardingComplete = (step: number, stepName: string, data?: Record<string, string | number | boolean>) => {
  trackEvent('onboarding_complete', {
    step_number: step,
    step_name: stepName,
    category: 'onboarding',
    ...data
  });
};

/**
 * 온보딩 이탈 추적
 */
export const trackOnboardingDropoff = (step: number, stepName: string, timeOnPage?: number) => {
  trackEvent('onboarding_dropoff', {
    step_number: step,
    step_name: stepName,
    category: 'onboarding',
    ...(timeOnPage !== undefined && { time_on_page: timeOnPage })
  });
};

/**
 * 사용자 선택 추적 (카테고리, 토픽, 리더 등)
 */
export const trackUserSelection = (selectionType: string, value: string, step?: number) => {
  trackEvent('user_selection', {
    selection_type: selectionType,
    selection_value: value,
    category: 'user_choice',
    ...(step !== undefined && { step_number: step })
  });
};

/**
 * 카드 관련 이벤트 추적
 */
export const trackCardEvent = (action: 'select' | 'reveal' | 'complete', cardData?: Record<string, string | number | boolean>) => {
  trackEvent(`card_${action}`, {
    category: 'tarot_cards',
    ...cardData
  });
};

/**
 * 결과 페이지 상호작용 추적
 */
export const trackResultInteraction = (action: 'share' | 'restart' | 'view_complete', data?: Record<string, string | number | boolean>) => {
  trackEvent(`result_${action}`, {
    category: 'result_page',
    ...data
  });
};

/**
 * 성능 지표 추적
 */
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  trackEvent('performance_metric', {
    metric_name: metric,
    metric_value: value,
    metric_unit: unit,
    category: 'performance'
  });
};

/**
 * 오류 추적
 */
export const trackError = (errorType: string, errorMessage: string, location?: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    category: 'errors',
    ...(location && { error_location: location })
  });
};

/**
 * 페이지 체류 시간 추적
 */
export const trackTimeOnPage = (pageName: string, timeSpent: number) => {
  trackEvent('time_on_page', {
    page_name: pageName,
    time_spent: timeSpent,
    category: 'engagement'
  });
};

/**
 * 사용자 속성 설정
 */
export const setUserProperty = (propertyName: string, value: string) => {
  if (!shouldInitializeGA) return;

  try {
    ReactGA.set({ [propertyName]: value });
    if (!isProduction) {
      // console.log('사용자 속성 설정:', propertyName, value);
    }
  } catch (error) {
    console.error('사용자 속성 설정 실패:', error);
  }
};

/**
 * 디버그 정보 출력 (개발 환경에서만)
 */
export const debugGA = () => {
  if (isProduction) return;

  // console.log('=== GA 디버그 정보 ===');
  // console.log('측정 ID:', GA_MEASUREMENT_ID);
  // console.log('환경:', isProduction ? 'Production' : 'Development');
  // console.log('GA 활성화:', shouldInitializeGA);
  // console.log('테스트 모드:', !isProduction);
};