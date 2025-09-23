import { useCallback, useMemo, useState, useEffect } from 'react';
import type {
  ColorPalette,
  ColorScale,
  SemanticColor,
  GradientType,
  ShadowType,
  TransitionType
} from '../types/colors';
import {
  colorCombinations,
  getColorVariable,
  getSemanticColorVariable,
  getGradientVariable,
  getShadowVariable,
  getTransitionVariable,
  setTheme,
  getCurrentTheme
} from '../types/colors';

// 전역 상태 관리를 위한 변수들
let globalTheme: 'light' | 'dark' = getCurrentTheme();
const themeListeners: Set<(theme: 'light' | 'dark') => void> = new Set();

export const useColors = () => {
  // 기본 컬러 팔레트 접근
  const getColor = useCallback((palette: ColorPalette, scale: ColorScale) => {
    return getColorVariable(palette, scale);
  }, []);

  // 시맨틱 컬러 접근
  const getSemanticColor = useCallback((color: SemanticColor) => {
    return getSemanticColorVariable(color);
  }, []);

  // 그라데이션 접근
  const getGradient = useCallback((gradient: GradientType) => {
    return getGradientVariable(gradient);
  }, []);

  // 그림자 접근
  const getShadow = useCallback((shadow: ShadowType) => {
    return getShadowVariable(shadow);
  }, []);

  // 트랜지션 접근
  const getTransition = useCallback((transition: TransitionType) => {
    return getTransitionVariable(transition);
  }, []);

  // 테마 관리
  const [theme, setThemeState] = useState<'light' | 'dark'>(globalTheme);

  // 전역 테마 변경 리스너 등록
  useEffect(() => {
    const listener = (newTheme: 'light' | 'dark') => {
      setThemeState(newTheme);
    };
    themeListeners.add(listener);
    return () => {
      themeListeners.delete(listener);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = globalTheme === 'dark' ? 'light' : 'dark';
    globalTheme = newTheme;
    setTheme(newTheme);

    // 모든 리스너에게 알림
    themeListeners.forEach(listener => listener(newTheme));

    return newTheme;
  }, []);

  const setLightTheme = useCallback(() => {
    globalTheme = 'light';
    setTheme('light');
    themeListeners.forEach(listener => listener('light'));
  }, []);

  const setDarkTheme = useCallback(() => {
    globalTheme = 'dark';
    setTheme('dark');
    themeListeners.forEach(listener => listener('dark'));
  }, []);

  // 자주 사용되는 스타일 조합들
  const styles = useMemo(() => ({
    // 타로 카드 스타일
    tarotCard: {
      background: colorCombinations.card.background,
      border: colorCombinations.card.border,
      color: colorCombinations.card.text,
      boxShadow: colorCombinations.card.shadow,
      borderRadius: '12px',
      padding: '16px',
      transition: getTransitionVariable('normal'),
    },
    
    // 메인 버튼 스타일
    primaryButton: {
      backgroundColor: colorCombinations.buttonPrimary.background,
      color: colorCombinations.buttonPrimary.text,
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      cursor: 'pointer',
      transition: getTransitionVariable('normal'),
      fontWeight: '600',
    },
    
    // 보조 버튼 스타일
    secondaryButton: {
      backgroundColor: colorCombinations.buttonSecondary.background,
      color: colorCombinations.buttonSecondary.text,
      border: `2px solid ${colorCombinations.buttonSecondary.border}`,
      borderRadius: '8px',
      padding: '12px 24px',
      cursor: 'pointer',
      transition: getTransitionVariable('normal'),
      fontWeight: '600',
    },
    
    // 텍스트 스타일들
    heading: {
      color: colorCombinations.text.primary,
      fontWeight: '700',
      marginBottom: '16px',
    },
    
    subheading: {
      color: colorCombinations.text.secondary,
      fontWeight: '600',
      marginBottom: '12px',
    },
    
    body: {
      color: colorCombinations.text.primary,
      lineHeight: '1.6',
    },
    
    muted: {
      color: colorCombinations.text.muted,
    },
    
    accent: {
      color: colorCombinations.text.accent,
    },
    
    gold: {
      color: colorCombinations.text.gold,
    },
    
    // AI 분석 결과 스타일들
    resultPositive: {
      color: colorCombinations.result.positive,
      backgroundColor: `${colorCombinations.result.positive}20`,
      padding: '8px 12px',
      borderRadius: '6px',
      border: `1px solid ${colorCombinations.result.positive}`,
    },
    
    resultNegative: {
      color: colorCombinations.result.negative,
      backgroundColor: `${colorCombinations.result.negative}20`,
      padding: '8px 12px',
      borderRadius: '6px',
      border: `1px solid ${colorCombinations.result.negative}`,
    },
    
    resultNeutral: {
      color: colorCombinations.result.neutral,
      backgroundColor: `${colorCombinations.result.neutral}20`,
      padding: '8px 12px',
      borderRadius: '6px',
      border: `1px solid ${colorCombinations.result.neutral}`,
    },
    
    resultMystical: {
      color: colorCombinations.result.mystical,
      backgroundColor: `${colorCombinations.result.mystical}20`,
      padding: '8px 12px',
      borderRadius: '6px',
      border: `1px solid ${colorCombinations.result.mystical}`,
    },
    
    // 컨테이너 스타일들
    container: {
      backgroundColor: getSemanticColorVariable('background'),
      color: getSemanticColorVariable('text'),
      minHeight: '100vh',
      padding: '20px',
    },
    
    card: {
      backgroundColor: getSemanticColorVariable('card'),
      border: `1px solid ${getSemanticColorVariable('border')}`,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: getShadowVariable('card'),
    },
    
    // 포커스 스타일
    focusable: {
      outline: 'none',
      '&:focus': {
        outline: `2px solid ${getSemanticColorVariable('focus-ring')}`,
        outlineOffset: '2px',
      },
    },
  }), []);

  return {
    // 기본 함수들
    getColor,
    getSemanticColor,
    getGradient,
    getShadow,
    getTransition,
    
    // 테마 관리
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    
    // 미리 정의된 스타일들
    styles,
    
    // 컬러 조합들
    combinations: colorCombinations,
  };
};

/**
 * 특정 컬러 팔레트만 사용하고 싶을 때의 훅
 */
export const useColorPalette = (palette: ColorPalette) => {
  const getColor = useCallback((scale: ColorScale) => {
    return getColorVariable(palette, scale);
  }, [palette]);

  return { getColor };
};

/**
 * 그라데이션만 사용하고 싶을 때의 훅
 */
export const useGradients = () => {
  const getGradient = useCallback((gradient: GradientType) => {
    return getGradientVariable(gradient);
  }, []);

  return { getGradient };
};
