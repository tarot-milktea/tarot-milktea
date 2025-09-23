import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  trackOnboardingEnter,
  trackOnboardingComplete,
  trackOnboardingDropoff,
  trackUserSelection,
  trackCardEvent,
  trackResultInteraction,
  trackTimeOnPage,
  trackError,
  trackPerformance
} from '../utils/analytics';

/**
 * 페이지 추적 자동화 훅
 */
export const usePageTracking = (pageName?: string, pageTitle?: string) => {
  const location = useLocation();
  const pageStartTime = useRef<number>(performance.now());

  useEffect(() => {
    // 페이지 진입 시 추적
    const currentPath = location.pathname + location.search;
    trackPageView(currentPath, pageTitle);

    // 페이지 시작 시간 기록
    pageStartTime.current = performance.now();

    // 컴포넌트 언마운트 시 체류 시간 추적
    return () => {
      if (pageName) {
        const timeOnPage = Math.round(performance.now() - pageStartTime.current);
        trackTimeOnPage(pageName, timeOnPage);
      }
    };
  }, [location, pageName, pageTitle]);
};

/**
 * 온보딩 페이지 전용 추적 훅
 */
export const useOnboardingTracking = (step: number, stepName: string) => {
  const pageStartTime = useRef<number>(performance.now());

  useEffect(() => {
    // 온보딩 페이지 진입 추적
    trackOnboardingEnter(step, stepName);
    pageStartTime.current = performance.now();

    // 페이지 이탈 시 dropoff 추적
    return () => {
      const timeOnPage = Math.round(performance.now() - pageStartTime.current);
      trackOnboardingDropoff(step, stepName, timeOnPage);
    };
  }, [step, stepName]);

  // 온보딩 완료 추적 함수 반환
  const trackComplete = useCallback((data?: Record<string, string | number | boolean>) => {
    trackOnboardingComplete(step, stepName, data);
  }, [step, stepName]);

  // 사용자 선택 추적 함수 반환
  const trackSelection = useCallback((selectionType: string, value: string) => {
    trackUserSelection(selectionType, value, step);
  }, [step]);

  return {
    trackComplete,
    trackSelection
  };
};

/**
 * 카드 관련 이벤트 추적 훅
 */
export const useCardTracking = () => {
  const trackCardSelect = useCallback((cardId: number, position: string) => {
    trackCardEvent('select', {
      card_id: cardId,
      card_position: position
    });
  }, []);

  const trackCardReveal = useCallback((cardId: number, position: string) => {
    trackCardEvent('reveal', {
      card_id: cardId,
      card_position: position
    });
  }, []);

  const trackCardComplete = useCallback((selectedCards: number[]) => {
    trackCardEvent('complete', {
      selected_cards: selectedCards.join(','),
      cards_count: selectedCards.length
    });
  }, []);

  return {
    trackCardSelect,
    trackCardReveal,
    trackCardComplete
  };
};

/**
 * 결과 페이지 전용 추적 훅
 */
export const useResultTracking = (resultId?: string) => {
  const pageStartTime = useRef<number>(performance.now());

  useEffect(() => {
    if (resultId) {
      // 결과 페이지 조회 추적
      trackPageView(`/result/${resultId}`, '타로 결과 페이지');
      trackResultInteraction('view_complete', { result_id: resultId });
      pageStartTime.current = performance.now();
    }

    return () => {
      // 결과 페이지 체류 시간 추적
      const timeOnPage = Math.round(performance.now() - pageStartTime.current);
      trackTimeOnPage('result_page', timeOnPage);
    };
  }, [resultId]);

  const trackShare = useCallback((shareMethod: 'native' | 'clipboard') => {
    if (resultId) {
      trackResultInteraction('share', {
        result_id: resultId,
        share_method: shareMethod
      });
    }
  }, [resultId]);

  const trackRestart = useCallback(() => {
    if (resultId) {
      trackResultInteraction('restart', {
        result_id: resultId
      });
    }
  }, [resultId]);

  return {
    trackShare,
    trackRestart
  };
};

/**
 * 성능 측정 훅
 */
export const usePerformanceTracking = () => {
  const trackLoadTime = useCallback((componentName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    trackPerformance(`${componentName}_load_time`, loadTime);
  }, []);

  const trackInteractionTime = useCallback((actionName: string, startTime: number) => {
    const interactionTime = performance.now() - startTime;
    trackPerformance(`${actionName}_interaction_time`, interactionTime);
  }, []);

  return {
    trackLoadTime,
    trackInteractionTime
  };
};

/**
 * 에러 추적 훅
 */
export const useErrorTracking = () => {
  const trackComponentError = useCallback((
    errorType: string,
    errorMessage: string,
    componentName: string
  ) => {
    trackError(errorType, errorMessage, componentName);
  }, []);

  const trackApiError = useCallback((
    endpoint: string,
    statusCode: number,
    errorMessage: string
  ) => {
    trackError('api_error', errorMessage, `${endpoint}_${statusCode}`);
  }, []);

  return {
    trackComponentError,
    trackApiError
  };
};

/**
 * 범용 사용자 인터랙션 추적 훅
 */
export const useUserInteraction = () => {
  const trackButtonClick = useCallback((buttonName: string) => {
    trackUserSelection('button_click', buttonName);
  }, []);

  const trackFormSubmit = useCallback((formName: string) => {
    trackUserSelection('form_submit', formName);
  }, []);

  const trackModalOpen = useCallback((modalName: string) => {
    trackUserSelection('modal_open', modalName);
  }, []);

  return {
    trackButtonClick,
    trackFormSubmit,
    trackModalOpen
  };
};