import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypingAnimationOptions {
  typingSpeed?: number; // 타이핑 속도 (ms)
  delay?: number; // 시작 지연 시간 (ms)
  showCursor?: boolean; // 커서 표시 여부
  onComplete?: () => void; // 완료 콜백
  skipAnimation?: boolean; // 애니메이션 스킵 (즉시 전체 텍스트 표시)
}

interface UseTypingAnimationReturn {
  displayedText: string;
  isCompleted: boolean;
  isTyping: boolean;
  reset: () => void;
  skip: () => void;
}

export function useTypingAnimation(
  text: string,
  options: UseTypingAnimationOptions = {}
): UseTypingAnimationReturn {
  const {
    typingSpeed = 50,
    delay = 0,
    onComplete,
    skipAnimation = false
  } = options;

  const [displayedText, setDisplayedText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const skipAnimationRef = useRef(skipAnimation);

  // skipAnimation이 변경될 때마다 ref 업데이트
  useEffect(() => {
    skipAnimationRef.current = skipAnimation;
  }, [skipAnimation]);

  // 타이핑 애니메이션 시작
  const startTyping = useCallback(() => {
    if (!text || skipAnimationRef.current) {
      setDisplayedText(text);
      setIsCompleted(true);
      setIsTyping(false);
      onComplete?.();
      return;
    }

    setIsTyping(true);
    setIsCompleted(false);
    currentIndexRef.current = 0;

    const typeNextCharacter = () => {
      if (currentIndexRef.current < text.length) {
        const nextIndex = currentIndexRef.current + 1;
        setDisplayedText(text.slice(0, nextIndex));
        currentIndexRef.current = nextIndex;

        timeoutRef.current = setTimeout(typeNextCharacter, typingSpeed);
      } else {
        setIsCompleted(true);
        setIsTyping(false);
        onComplete?.();
      }
    };

    // 지연 시간 후 타이핑 시작
    timeoutRef.current = setTimeout(typeNextCharacter, delay);
  }, [text, typingSpeed, delay, onComplete]);

  // 애니메이션 스킵
  const skip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setDisplayedText(text);
    setIsCompleted(true);
    setIsTyping(false);
    onComplete?.();
  }, [text, onComplete]);

  // 리셋
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setDisplayedText('');
    setIsCompleted(false);
    setIsTyping(false);
    currentIndexRef.current = 0;
  }, []);

  // 텍스트가 변경되면 애니메이션 시작
  useEffect(() => {
    if (text) {
      reset();
      startTyping();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, startTyping, reset]);

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isCompleted,
    isTyping,
    reset,
    skip
  };
}