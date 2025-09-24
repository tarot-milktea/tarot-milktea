import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  const previousStepRef = useRef(currentStep);
  const [animationKey, setAnimationKey] = useState(0);

  const currentProgress = Math.max(0, Math.min(currentStep - 1, totalSteps - 1)) / (totalSteps - 1);
  const previousProgress = Math.max(0, Math.min(previousStepRef.current - 1, totalSteps - 1)) / (totalSteps - 1);

  const currentDotPosition = currentProgress * 100;
  const previousDotPosition = previousProgress * 100;

  useEffect(() => {
    if (previousStepRef.current !== currentStep) {
      // 애니메이션이 끝난 후에 previousStep을 업데이트
      const timer = setTimeout(() => {
        previousStepRef.current = currentStep;
      }, 800); // 애니메이션 duration과 동일

      setAnimationKey(prev => prev + 1); // 강제로 리렌더링

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <ProgressContainer className={className}>
      <ProgressTrack>
        {/* 배경 트랙의 단계 표시 */}
        <StepMarkers>
          {Array.from({ length: totalSteps }, (_, index) => (
            <StepMarker
              key={index}
              isActive={index + 1 === currentStep}
              isPassed={index + 1 < currentStep}
            />
          ))}
        </StepMarkers>

        {/* 진행된 부분의 트레일 */}
        <ProgressFill
          key={`fill-${animationKey}`}
          initial={{ width: `${previousDotPosition}%` }}
          animate={{ width: `${currentDotPosition}%` }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />

        {/* 움직이는 골드 닷 */}
        <ProgressDot
          key={`dot-${animationKey}`}
          initial={{ left: `${previousDotPosition}%` }}
          animate={{ left: `${currentDotPosition}%` }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ marginLeft: '-6px' }}
        />
      </ProgressTrack>
    </ProgressContainer>
  );
}

const ProgressContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.25);
  z-index: 1000;
  display: flex;
  padding: 0 24px;
  box-sizing: border-box;
  align-items: center;
`;

const ProgressTrack = styled.div`
  position: relative;
  width: 100%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
  overflow: hidden;
`;

const ProgressDot = styled(motion.div)`
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow:
    0 0 12px rgba(255, 215, 0, 0.6),
    0 0 24px rgba(255, 215, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
    border-radius: 50%;
  }
`;

const ProgressFill = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg,
    rgba(255, 215, 0, 0.8) 0%,
    rgba(255, 215, 0, 0.4) 70%,
    rgba(255, 215, 0, 0.1) 100%
  );
  border-radius: 1px;
  z-index: 1;
`;

const StepMarkers = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 0;
`;

const StepMarker = styled.div<{ isActive: boolean; isPassed: boolean }>`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: ${({ isActive, isPassed }) => {
    if (isPassed) return 'rgba(255, 215, 0, 0.6)';
    if (isActive) return 'rgba(255, 215, 0, 0.8)';
    return 'rgba(255, 255, 255, 0.2)';
  }};
  transition: background-color 0.3s ease;
`;

export default ProgressBar;