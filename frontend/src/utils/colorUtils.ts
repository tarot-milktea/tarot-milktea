/**
 * 컬러 시스템을 위한 유틸리티 함수들
 * CSS-in-JS, styled-components, emotion 등에서 사용할 수 있습니다.
 */

import { 
  ColorPalette, 
  ColorScale, 
  SemanticColor, 
  GradientType, 
  ShadowType, 
  TransitionType,
  getColorVariable,
  getSemanticColorVariable,
  getGradientVariable,
  getShadowVariable,
  getTransitionVariable
} from '../types/colors';

/**
 * CSS 변수를 반환하는 유틸리티 함수들
 */
export const colors = {
  // 기본 컬러 팔레트
  primary: (scale: ColorScale) => getColorVariable('primary', scale),
  accent: (scale: ColorScale) => getColorVariable('accent', scale),
  gold: (scale: ColorScale) => getColorVariable('gold', scale),
  neutral: (scale: ColorScale) => getColorVariable('neutral', scale),
  success: (scale: ColorScale) => getColorVariable('success', scale),
  error: (scale: ColorScale) => getColorVariable('error', scale),
  warning: (scale: ColorScale) => getColorVariable('warning', scale),
  info: (scale: ColorScale) => getColorVariable('info', scale),

  // 시맨틱 컬러
  background: () => getSemanticColorVariable('background'),
  backgroundSecondary: () => getSemanticColorVariable('background-secondary'),
  card: () => getSemanticColorVariable('card'),
  cardHover: () => getSemanticColorVariable('card-hover'),
  border: () => getSemanticColorVariable('border'),
  borderFocus: () => getSemanticColorVariable('border-focus'),
  borderAccent: () => getSemanticColorVariable('border-accent'),
  text: () => getSemanticColorVariable('text'),
  textSecondary: () => getSemanticColorVariable('text-secondary'),
  textMuted: () => getSemanticColorVariable('text-muted'),
  textAccent: () => getSemanticColorVariable('text-accent'),
  textGold: () => getSemanticColorVariable('text-gold'),
};

/**
 * 그라데이션 유틸리티
 */
export const gradients = {
  primary: () => getGradientVariable('primary'),
  accent: () => getGradientVariable('accent'),
  mystical: () => getGradientVariable('mystical'),
  card: () => getGradientVariable('card'),
  glow: () => getGradientVariable('glow'),
};

/**
 * 그림자 유틸리티
 */
export const shadows = {
  sm: () => getShadowVariable('sm'),
  md: () => getShadowVariable('md'),
  lg: () => getShadowVariable('lg'),
  xl: () => getShadowVariable('xl'),
  glow: () => getShadowVariable('glow'),
  card: () => getShadowVariable('card'),
};

/**
 * 트랜지션 유틸리티
 */
export const transitions = {
  fast: () => getTransitionVariable('fast'),
  normal: () => getTransitionVariable('normal'),
  slow: () => getTransitionVariable('slow'),
  bounce: () => getTransitionVariable('bounce'),
};

/**
 * 미리 정의된 스타일 조합들
 */
export const stylePresets = {
  // 타로 카드 스타일
  tarotCard: {
    backgroundColor: colors.card(),
    border: `1px solid ${colors.borderAccent()}`,
    borderRadius: '12px',
    padding: '16px',
    boxShadow: shadows.card(),
    transition: transitions.normal(),
    '&:hover': {
      backgroundColor: colors.cardHover(),
      boxShadow: shadows.glow(),
    },
  },

  // 버튼 스타일들
  buttonPrimary: {
    backgroundColor: colors.accent('500'),
    color: colors.primary('900'),
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    transition: transitions.normal(),
    fontWeight: '600',
    '&:hover': {
      backgroundColor: colors.accent('600'),
    },
    '&:disabled': {
      backgroundColor: colors.accent('800'),
      cursor: 'not-allowed',
    },
  },

  buttonSecondary: {
    backgroundColor: colors.primary('600'),
    color: colors.text(),
    border: `2px solid ${colors.borderAccent()}`,
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    transition: transitions.normal(),
    fontWeight: '600',
    '&:hover': {
      backgroundColor: colors.primary('500'),
    },
  },

  buttonGhost: {
    backgroundColor: 'transparent',
    color: colors.textAccent(),
    border: `2px solid ${colors.borderAccent()}`,
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    transition: transitions.normal(),
    fontWeight: '600',
    '&:hover': {
      backgroundColor: colors.primary('700'),
    },
  },

  // 텍스트 스타일들
  heading: {
    color: colors.text(),
    fontWeight: '700',
    marginBottom: '16px',
  },

  subheading: {
    color: colors.textSecondary(),
    fontWeight: '600',
    marginBottom: '12px',
  },

  body: {
    color: colors.text(),
    lineHeight: '1.6',
  },

  muted: {
    color: colors.textMuted(),
  },

  accent: {
    color: colors.textAccent(),
  },

  gold: {
    color: colors.textGold(),
  },

  // AI 분석 결과 스타일들
  resultPositive: {
    color: colors.success('400'),
    backgroundColor: `${colors.success('400')}20`,
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.success('400')}`,
  },

  resultNegative: {
    color: colors.error('400'),
    backgroundColor: `${colors.error('400')}20`,
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.error('400')}`,
  },

  resultNeutral: {
    color: colors.info('400'),
    backgroundColor: `${colors.info('400')}20`,
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.info('400')}`,
  },

  resultMystical: {
    color: colors.textAccent(),
    backgroundColor: `${colors.textAccent()}20`,
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.textAccent()}`,
  },

  // 컨테이너 스타일들
  container: {
    backgroundColor: colors.background(),
    color: colors.text(),
    minHeight: '100vh',
    padding: '20px',
  },

  card: {
    backgroundColor: colors.card(),
    border: `1px solid ${colors.border()}`,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: shadows.card(),
  },

  // 포커스 스타일
  focusable: {
    outline: 'none',
    '&:focus': {
      outline: `2px solid ${colors.borderFocus()}`,
      outlineOffset: '2px',
    },
  },
};

/**
 * 반응형 디자인을 위한 미디어 쿼리
 */
export const mediaQueries = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (min-width: 769px) and (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)',
};

/**
 * 애니메이션을 위한 키프레임
 */
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideUp: `
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  glow: `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px ${colors.textAccent()}; }
      50% { box-shadow: 0 0 20px ${colors.textAccent()}, 0 0 30px ${colors.textAccent()}; }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `,
};

/**
 * 스타일을 조건부로 적용하는 헬퍼 함수
 */
export const conditionalStyle = (condition: boolean, trueStyle: any, falseStyle: any = {}) => {
  return condition ? trueStyle : falseStyle;
};

/**
 * 여러 스타일을 병합하는 헬퍼 함수
 */
export const mergeStyles = (...styles: any[]) => {
  return Object.assign({}, ...styles);
};

/**
 * CSS 변수를 직접 사용하는 헬퍼 함수
 */
export const cssVar = (variableName: string) => `var(--${variableName})`;

/**
 * 컬러에 투명도를 추가하는 헬퍼 함수
 */
export const withOpacity = (color: string, opacity: number) => {
  // CSS 변수인 경우 rgba로 변환
  if (color.startsWith('var(')) {
    return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
  }
  
  // 일반 색상인 경우 (간단한 구현)
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};
