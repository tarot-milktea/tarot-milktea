// 타로 카드 곡선 배치를 위한 계산 함수들

export interface CardPosition {
  x: number;
  y: number;
  rotation: number;
  row: number;
  indexInRow: number;
}

// 카드 배치 설정
const LAYOUT_CONFIG = {
  TOTAL_CARDS: 72,
  ROWS: 4,
  CARDS_PER_ROW: 18,
  ARC_DEGREES: 45, // 각 줄의 호 각도 완만하게 (60도->45도)
  RADIUS: 500, // 곡선의 반지름 증가로 더 완만하게 (400->500px)
  ROW_HEIGHT: 140, // 줄 간 간격
  CARD_OVERLAP: 0.82, // 카드 겹침 정도 (1이면 겹치지 않음, 0.5면 50% 겹침)
};

// 모바일 전용 설정
const MOBILE_LAYOUT_CONFIG = {
  ...LAYOUT_CONFIG,
  ARC_DEGREES: 50, // 모바일에서도 완만하게 (70->50도)
  RADIUS: 400, // 반지름 증가로 완만함 (300->400px)
  ROW_HEIGHT: 110, // 줄 간 간격 줄임
  CARD_OVERLAP: 0.72, // 더 많이 겹쳐서 공간 절약
};

// 데스크톱 전용 설정 (3줄 24장)
const DESKTOP_LAYOUT_CONFIG = {
  TOTAL_CARDS: 72,
  ROWS: 3,
  CARDS_PER_ROW: 24,
  ARC_DEGREES: 75, // 완만한 곡선 (100->75도)
  RADIUS: 600, // 더 큰 반지름으로 완만함 증대 (500->600px)
  ROW_HEIGHT: 180, // 3줄이므로 줄 간격 더 증가 (160->180px)
  CARD_OVERLAP: 0.8, // 좀 더 여유로운 간격 (0.75->0.8)
};


export function getScreenType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  if (window.innerWidth <= 768) return 'mobile';
  if (window.innerWidth >= 1024) return 'desktop';
  return 'tablet'; // 768px ~ 1024px
}

/**
 * 카드 인덱스(0-71)를 받아서 곡선 위의 위치와 회전각을 계산
 */
export function calculateCardPosition(cardIndex: number, screenType?: 'mobile' | 'tablet' | 'desktop'): CardPosition {
  const currentScreenType = screenType ?? getScreenType();
  
  let config;
  if (currentScreenType === 'desktop') {
    config = DESKTOP_LAYOUT_CONFIG;
  } else {
    // mobile과 tablet은 모두 모바일 설정 사용
    config = MOBILE_LAYOUT_CONFIG;
  }
  
  const { CARDS_PER_ROW, ARC_DEGREES, RADIUS, ROW_HEIGHT, CARD_OVERLAP } = config;
  
  // 어느 줄인지 계산 (0부터 시작)
  const row = Math.floor(cardIndex / CARDS_PER_ROW);
  
  // 해당 줄에서의 인덱스 (0부터 시작)
  const indexInRow = cardIndex % CARDS_PER_ROW;
  
  // 호의 시작각과 끝각 (라디안)
  const arcRadians = (ARC_DEGREES * Math.PI) / 180;
  const startAngle = -arcRadians / 2; // 중앙을 기준으로 좌우 대칭
  const endAngle = arcRadians / 2;
  
  // 카드 간의 각도 간격 (겹침 고려)
  const angleStep = (endAngle - startAngle) / (CARDS_PER_ROW - 1) * CARD_OVERLAP;
  const currentAngle = startAngle + (angleStep * indexInRow);
  
  // 곡선 위의 위치 계산 (원의 방정식 사용)
  const x = RADIUS * Math.sin(currentAngle);
  const y = row * ROW_HEIGHT - RADIUS * (1 - Math.cos(currentAngle)) - 120; // 원래대로 아래로 볼록한 곡선 유지
  
  // 카드의 회전각 (접선 방향, 도 단위) - 데스크톱에서는 회전각을 줄여서 자연스럽게
  let rotation = (currentAngle * 180) / Math.PI;
  
  // 데스크톱 3줄 배치에서는 회전각을 70%로 줄여서 부자연스러움 완화
  if (currentScreenType === 'desktop') {
    rotation = rotation * 0.7;
  }
  
  return {
    x,
    y,
    rotation,
    row,
    indexInRow,
  };
}

/**
 * 모든 카드의 위치 정보를 미리 계산
 */
export function calculateAllCardPositions(screenType?: 'mobile' | 'tablet' | 'desktop'): CardPosition[] {
  const currentScreenType = screenType ?? getScreenType();
  const totalCards = currentScreenType === 'desktop' ? DESKTOP_LAYOUT_CONFIG.TOTAL_CARDS : MOBILE_LAYOUT_CONFIG.TOTAL_CARDS;
  
  return Array.from({ length: totalCards }, (_, index) =>
    calculateCardPosition(index, currentScreenType)
  );
}

/**
 * 반응형을 위한 스케일 팩터 계산
 */
export function getResponsiveScale(containerWidth: number): number {
  const screenType = getScreenType();

  let baseWidth: number;
  let minScale: number;
  let maxScale: number;

  // 화면 크기별 차등 스케일링 적용
  if (screenType === 'mobile') {
    baseWidth = 600; // 모바일 기준 너비
    minScale = 0.8; // 모바일에서는 덜 축소
    maxScale = 1.0;
  } else if (screenType === 'tablet') {
    baseWidth = 800; // 태블릿 기준 너비
    minScale = 0.75;
    maxScale = 1.1;
  } else {
    baseWidth = 900; // 데스크톱 기준 너비 (1200 -> 900으로 조정)
    minScale = 0.7; // 최소 스케일 상향 조정 (0.5 -> 0.7)
    maxScale = 1.2;
  }

  const scale = Math.min(maxScale, Math.max(minScale, containerWidth / baseWidth));
  return scale;
}

/**
 * 카드 레이아웃의 실제 필요한 높이를 계산 (실제 카드 위치 기반)
 */
export function calculateLayoutHeight(screenType?: 'mobile' | 'tablet' | 'desktop'): number {
  const positions = calculateAllCardPositions(screenType);

  if (positions.length === 0) return 400;

  // 모든 카드 위치에서 최상단과 최하단 Y 좌표를 찾음
  const yPositions = positions.map(pos => pos.y);
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);

  // 카드 크기 고려 (카드 높이의 절반씩 위아래로 추가)
  const cardHeight = 80; // 실제 카드 높이
  const padding = 40; // 최소 여유 공간

  const totalHeight = (maxY - minY) + cardHeight + (padding * 2);

  // 최소/최대 높이 제한
  return Math.max(300, Math.min(600, totalHeight));
}

/**
 * 애니메이션 지연 시간 계산 (좌에서 우로 순차적으로 나타나도록)
 */
export function calculateAnimationDelay(cardIndex: number): number {
  const baseDelay = 0.05; // 기본 지연 시간 (초)
  const incrementPerCard = 0.015; // 카드당 추가 지연 시간
  const rowDelay = 0.08; // 줄별 추가 지연 시간

  const { CARDS_PER_ROW } = LAYOUT_CONFIG;
  const row = Math.floor(cardIndex / CARDS_PER_ROW);
  const indexInRow = cardIndex % CARDS_PER_ROW;

  // 좌에서 우로 순차적으로 나타나도록 계산
  // 각 줄의 시작 시간 + 해당 줄에서의 위치별 지연
  return baseDelay + (row * rowDelay) + (indexInRow * incrementPerCard);
}