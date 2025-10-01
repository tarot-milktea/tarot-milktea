import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useTypingAnimation } from '../../../hooks/useTypingAnimation';

interface TypingTextProps {
  text: string;
  typingSpeed?: number;
  delay?: number;
  showCursor?: boolean;
  onComplete?: () => void;
  skipAnimation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const TypingText = forwardRef<HTMLDivElement, TypingTextProps>(({
  text,
  typingSpeed = 50,
  delay = 0,
  showCursor = true,
  onComplete,
  skipAnimation = false,
  className,
  style,
  onClick
}, ref) => {
  const { displayedText, isCompleted, isTyping } = useTypingAnimation(text, {
    typingSpeed,
    delay,
    showCursor,
    onComplete,
    skipAnimation
  });

  return (
    <TypingContainer
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
    >
      <TextContent>
        {displayedText}
        {showCursor && !isCompleted && (
          <Cursor isVisible={isTyping} />
        )}
      </TextContent>
    </TypingContainer>
  );
});

TypingText.displayName = 'TypingText';

// 커서 깜빡임 애니메이션
const blink = keyframes`
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
`;

const TypingContainer = styled.div`
  width: 100%;
`;

const TextContent = styled.span`
  position: relative;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Cursor = styled.span<{ isVisible: boolean }>`
  display: ${props => props.isVisible ? 'inline-block' : 'none'};
  width: 2px;
  height: 1.2em;
  background-color: var(--color-accent-300, #007bff);
  margin-left: 2px;
  animation: ${blink} 1s infinite;
  vertical-align: text-bottom;
`;

export default TypingText;