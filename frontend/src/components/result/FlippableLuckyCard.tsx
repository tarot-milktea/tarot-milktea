import { useState } from 'react';
import styled from '@emotion/styled';

interface FlippableLuckyCardProps {
  luckyCard?: {
    name: string;
    message: string;
    imageUrl: string;
  };
  onFlip?: (isFlipped: boolean) => void;
}

function FlippableLuckyCard({ luckyCard, onFlip }: FlippableLuckyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (luckyCard && !isFlipped) {
      setIsFlipped(true);
      onFlip?.(true);
    }
  };

  return (
    <CardContainer onClick={handleClick} isClickable={!!luckyCard && !isFlipped}>
      <CardInner isFlipped={isFlipped}>
        {/* 카드 뒷면 */}
        <CardBack>
          <CardPattern>
            <PatternElement />
            <PatternElement />
            <PatternElement />
            <PatternElement />
          </CardPattern>
          <BackText>🍀</BackText>
          <BackSubtext>오늘의 행운카드</BackSubtext>
          {!isFlipped && (
            <ClickHint>클릭하여 확인하세요</ClickHint>
          )}
        </CardBack>

        {/* 카드 앞면 */}
        <CardFront>
          {luckyCard ? (
            <CardImage
              src={luckyCard.imageUrl}
              alt={`${luckyCard.name} 행운 카드`}
            />
          ) : (
            <LoadingContent>
              <LoadingText>행운 카드를 불러오는 중...</LoadingText>
            </LoadingContent>
          )}
        </CardFront>
      </CardInner>
    </CardContainer>
  );
}

const CardContainer = styled.div<{ isClickable: boolean }>`
  perspective: 1000px;
  width: 240px;
  height: 320px;
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  transition: none;
`;

const CardInner = styled.div<{ isFlipped: boolean }>`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: none;
  position: relative;

  ${props => props.isFlipped && `
    transform: rotateY(180deg);
  `}
`;

const CardBack = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    var(--color-primary-800) 0%,
    var(--color-primary-700) 50%,
    var(--color-primary-800) 100%
  );
  border: 3px solid var(--color-accent-400);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow:
    0 0 30px var(--color-accent-400),
    inset 0 0 30px rgba(255, 237, 77, 0.2);
`;

const CardFront = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
`;

const CardPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
  background: radial-gradient(
      circle at 25% 25%,
      var(--color-accent-500) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 75% 75%,
      var(--color-gold-400) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 25% 75%,
      var(--color-accent-400) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 75% 25%,
      var(--color-gold-300) 0%,
      transparent 40%
    );
`;

const PatternElement = styled.div`
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-accent-300);
  border-radius: 50%;
  opacity: 0.6;

  &:nth-of-type(1) {
    top: 15%;
    left: 15%;
    animation: pulse 2s infinite;
  }
  &:nth-of-type(2) {
    top: 15%;
    right: 15%;
    animation: pulse 2s infinite 0.5s;
  }
  &:nth-of-type(3) {
    bottom: 15%;
    left: 15%;
    animation: pulse 2s infinite 1s;
  }
  &:nth-of-type(4) {
    bottom: 15%;
    right: 15%;
    animation: pulse 2s infinite 1.5s;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`;

const BackText = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
  z-index: 2;
  text-shadow: 0 0 20px var(--color-accent-400);
`;

const BackSubtext = styled.div`
  font-size: 1.2rem;
  color: var(--color-accent-300);
  font-weight: 600;
  text-align: center;
  z-index: 2;
  text-shadow: 0 0 10px var(--color-accent-400);
  margin-bottom: 16px;
`;

const ClickHint = styled.div`
  font-size: 0.9rem;
  color: var(--color-primary-200);
  text-align: center;
  z-index: 2;
  opacity: 0.8;
  font-style: italic;
  animation: breathe 2s ease-in-out infinite;

  @keyframes breathe {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;


const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const LoadingText = styled.div`
  color: var(--color-primary-300);
  font-size: 1rem;
  font-style: italic;
  text-align: center;
`;

export default FlippableLuckyCard;