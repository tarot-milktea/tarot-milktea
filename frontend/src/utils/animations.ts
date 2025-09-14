// 타로 카드 애니메이션을 위한 Framer Motion variants

/**
 * 카드 컨테이너 애니메이션 variants (stagger 제거)
 */
export const cardContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      when: "afterChildren",
    },
  },
};

/**
 * 개별 카드 애니메이션 variants (위치 정보를 받아서 동적으로 계산)
 */
export const cardVariants = {
  hidden: (custom: { position: { x: number; y: number; rotation: number }, delay: number }) => ({
    scale: 0,
    rotateY: -180,
    opacity: 0,
    x: custom.position.x - 200, // 좌측에서 입장
    y: custom.position.y,
    rotate: custom.position.rotation,
  }),
  visible: (custom: { position: { x: number; y: number; rotation: number }, delay: number }) => ({
    scale: 1,
    rotateY: 0,
    opacity: 1,
    x: custom.position.x,
    y: custom.position.y,
    rotate: custom.position.rotation,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1,
      delay: custom.delay,
      duration: 0.6,
    },
  }),
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
  hover: (custom: { position: { x: number; y: number; rotation: number }, delay: number }) => ({
    scale: 1.02,
    y: custom.position.y - 8, // 현재 위치에서 8px 위로
    zIndex: 10,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  }),
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * 선택된 카드 강조 애니메이션
 */
export const selectedCardVariants = {
  selected: {
    scale: 1.1,
    y: -20,
    boxShadow: "0 20px 40px rgba(255, 237, 77, 0.4)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  unselected: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

/**
 * 카드 뒤집기 애니메이션 (결과 표시용)
 */
export const flipCardVariants = {
  front: {
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  back: {
    rotateY: 180,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

/**
 * 로딩/대기 상태 애니메이션
 */
export const loadingVariants = {
  idle: {},
  loading: {
    rotate: [0, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * 접근성을 위한 reduced motion variants
 */
export const reducedMotionVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * reduced motion이 활성화된 경우의 카드 variants
 */
export const reducedMotionCardVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    opacity: 0.8,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * 미디어 쿼리로 reduced motion 감지
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};