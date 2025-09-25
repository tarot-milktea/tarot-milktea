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
        {/* 진행된 부분의 트레일 - 선이 움직이는 효과 */}
        <ProgressFill
          key={`fill-${animationKey}`}
          initial={{ width: `${previousDotPosition}%` }}
          animate={{ width: `${currentDotPosition}%` }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
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

const ProgressFill = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 215, 0, 0.4) 30%,
    rgba(255, 215, 0, 0.8) 100%
  );
  border-radius: 1px;
  z-index: 1;
`;

export default ProgressBar;