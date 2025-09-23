/**
 * 타로 카드 서비스 컬러 시스템 타입 정의
 * CSS 변수를 TypeScript에서 타입 안전하게 사용할 수 있도록 도와줍니다.
 */

export type ColorScale = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export type ColorPalette = 'primary' | 'accent' | 'gold' | 'neutral' | 'success' | 'error' | 'warning' | 'info';

export type SemanticColor = 
  | 'background'
  | 'background-secondary'
  | 'card'
  | 'card-hover'
  | 'border'
  | 'border-focus'
  | 'border-accent'
  | 'text'
  | 'text-secondary'
  | 'text-muted'
  | 'text-accent'
  | 'text-gold'
  | 'button-primary'
  | 'button-primary-hover'
  | 'button-primary-text'
  | 'button-primary-disabled'
  | 'button-secondary'
  | 'button-secondary-hover'
  | 'button-secondary-text'
  | 'button-secondary-border'
  | 'button-ghost'
  | 'button-ghost-hover'
  | 'button-ghost-text'
  | 'button-ghost-border'
  | 'card-back'
  | 'card-front'
  | 'card-border'
  | 'card-shadow'
  | 'card-glow'
  | 'result-positive'
  | 'result-negative'
  | 'result-neutral'
  | 'result-mystical'
  | 'focus-ring'
  | 'focus-bg'
  | 'selection'
  | 'selection-text';

export type GradientType = 'primary' | 'accent' | 'mystical' | 'card' | 'glow';

export type ShadowType = 'sm' | 'md' | 'lg' | 'xl' | 'glow' | 'card';

export type TransitionType = 'fast' | 'normal' | 'slow' | 'bounce';

/**
 * CSS 변수 이름을 생성하는 헬퍼 함수들
 */
export const getColorVariable = (palette: ColorPalette, scale: ColorScale): string => 
  `var(--color-${palette}-${scale})`;

export const getSemanticColorVariable = (color: SemanticColor): string => 
  `var(--color-${color})`;

export const getGradientVariable = (gradient: GradientType): string => 
  `var(--gradient-${gradient})`;

export const getShadowVariable = (shadow: ShadowType): string => 
  `var(--shadow-${shadow})`;

export const getTransitionVariable = (transition: TransitionType): string => 
  `var(--transition-${transition})`;

/**
 * 자주 사용되는 컬러 조합들
 */
export const colorCombinations = {
  // 타로 카드 기본 조합
  card: {
    background: 'var(--color-card)',
    border: 'var(--color-card-border)',
    text: 'var(--color-text)',
    shadow: 'var(--shadow-card)',
  },
  
  // 버튼 조합
  buttonPrimary: {
    background: 'var(--color-button-primary)',
    hover: 'var(--color-button-primary-hover)',
    text: 'var(--color-button-primary-text)',
    disabled: 'var(--color-button-primary-disabled)',
  },
  
  buttonSecondary: {
    background: 'var(--color-button-secondary)',
    hover: 'var(--color-button-secondary-hover)',
    text: 'var(--color-button-secondary-text)',
    border: 'var(--color-button-secondary-border)',
  },
  
  // 텍스트 조합
  text: {
    primary: 'var(--color-text)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
    accent: 'var(--color-text-accent)',
    gold: 'var(--color-text-gold)',
  },
  
  // AI 분석 결과 조합
  result: {
    positive: 'var(--color-result-positive)',
    negative: 'var(--color-result-negative)',
    neutral: 'var(--color-result-neutral)',
    mystical: 'var(--color-result-mystical)',
  },
} as const;

/**
 * CSS 변수를 사용하는 스타일 객체를 생성하는 헬퍼 함수
 */
export const createStyleWithColors = (styles: Record<string, string>) => {
  return styles;
};

/**
 * 반응형 디자인을 위한 미디어 쿼리 헬퍼
 */
export const mediaQueries = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
} as const;

/**
 * 테마 전환을 위한 헬퍼 함수
 */
export const setTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const getCurrentTheme = (): 'light' | 'dark' => {
  const storedTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';

  if (storedTheme) {
    return storedTheme;
  }

  const defaultTheme = 'dark';

  // 기본 테마 설정
  document.documentElement.setAttribute('data-theme', defaultTheme);

  return defaultTheme;
};

