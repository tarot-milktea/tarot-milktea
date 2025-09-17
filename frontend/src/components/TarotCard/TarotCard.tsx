import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useCardStore } from '../../store/cardStore';
import type { PredefinedCard } from '../../store/sessionStore';
import CardVideo from './CardVideo';

interface TarotCardProps {
  cardId: number;
  size?: 'small' | 'large';
  predefinedCard?: PredefinedCard;
}

const TarotCard: React.FC<TarotCardProps> = ({ cardId, size = 'small', predefinedCard }) => {
  const { selectedCards, selectCard, deselectCard, isRevealing, revealedCards } = useCardStore();

  const cardState = useMemo(() => {
    const isSelected = selectedCards.some(card => card.id === cardId);
    const selectedCard = selectedCards.find(card => card.id === cardId);
    const isRevealed = revealedCards.includes(cardId);
    
    return {
      isSelected,
      selectedCard,
      isRevealed
    };
  }, [selectedCards, revealedCards, cardId]);
  
  const { isSelected, selectedCard, isRevealed } = cardState;
  const isFlipped = isRevealing && isSelected && isRevealed;
  
  const handleClick = () => {
    if (isRevealing) return;
    
    if (isSelected) {
      deselectCard(cardId);
    } else if (selectedCards.length < 3) {
      selectCard(cardId);
    }
  };


  return (
    <CardContainer 
      onClick={handleClick}
      size={size}
      isSelected={isSelected}
      isRevealing={isRevealing}
    >
      <CardInner isFlipped={isFlipped} isReversed={isFlipped && predefinedCard?.orientation === 'reversed'}>
        <CardBack isSelected={isSelected}>
          <CardPattern>
            <PatternElement />
            <PatternElement />
            <PatternElement />
            <PatternElement />
          </CardPattern>
          <CardNumber>{cardId}</CardNumber>
        </CardBack>
        <CardFront isReversed={predefinedCard?.orientation === 'reversed'}>
          {selectedCard && (
            <>
              <PositionLabel>
                {selectedCard.position === 'past' && '과거'}
                {selectedCard.position === 'present' && '현재'}
                {selectedCard.position === 'future' && '미래'}
              </PositionLabel>
              <OrientationIndicator isReversed={predefinedCard?.orientation === 'reversed'}>
                {predefinedCard?.orientation === 'upright' ? '정방향' : '역방향'}
              </OrientationIndicator>
            </>
          )}
          {/* 카드가 뒤집힌 상태에서만 비디오 표시 */}
          {isFlipped ? (
            <CardVideo
              cardId={predefinedCard?.cardId || cardId}
              isReversed={predefinedCard?.orientation === 'reversed'}
              size={size}
              autoPlay={true}
              videoUrl={predefinedCard?.videoUrl}
              cardName={predefinedCard?.nameKo}
            />
          ) : (
            <CardImagePlaceholder />
          )}
        </CardFront>
      </CardInner>
      
    </CardContainer>
  );
};

const CardContainer = styled.div<{
  size: 'small' | 'large';
  isSelected: boolean;
  isRevealing: boolean;
}>`
  perspective: 1000px;
  cursor: ${props => props.isRevealing ? 'default' : 'pointer'};
  position: relative;
  
  ${props => props.size === 'small' ? `
    width: 60px;
    height: 90px;
  ` : `
    width: 200px;
    height: 300px;
  `}
  
  ${props => props.isSelected && `
    filter: drop-shadow(0 0 20px var(--color-accent-400));
    transform: scale(1.05);
  `}
  
  transition: all 0.3s ease;
  
  &:hover {
    ${props => !props.isRevealing && `
      transform: translateY(-5px) ${props.isSelected ? 'scale(1.05)' : ''};
    `}
  }
`;

const CardInner = styled.div<{ isFlipped: boolean; isReversed?: boolean }>`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
  position: relative;
  
  ${props => props.isFlipped && `
    transform: rotateY(180deg) ${props.isReversed ? 'rotateZ(180deg)' : ''};
  `}
  
  ${props => !props.isFlipped && props.isReversed && `
    transform: rotateZ(180deg);
  `}
`;

const CardBack = styled.div<{
  isSelected: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, 
    var(--color-primary-800) 0%, 
    var(--color-primary-700) 50%,
    var(--color-primary-800) 100%
  );
  border: 2px solid var(--color-primary-600);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  
  ${props => props.isSelected && `
    border-color: var(--color-accent-400);
    background: linear-gradient(135deg, 
      var(--color-primary-700) 0%, 
      var(--color-primary-600) 50%,
      var(--color-primary-700) 100%
    );
    box-shadow: 
      0 0 30px var(--color-accent-400),
      inset 0 0 20px var(--color-accent-400);
  `}
`;

const CardFront = styled.div<{ isReversed?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  border-radius: 12px;
  background: var(--color-card-front-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-card-front-border);
  box-sizing: border-box;
  
  ${props => props.isReversed && `
    border-color: var(--color-gold-400);
    background: linear-gradient(135deg, 
      var(--color-card-front-bg) 0%, 
      rgba(255, 237, 77, 0.1) 100%
    );
  `}
`;

const CardPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  background: radial-gradient(circle at 30% 30%, 
    var(--color-accent-500) 0%, 
    transparent 50%
  ),
  radial-gradient(circle at 70% 70%, 
    var(--color-gold-400) 0%, 
    transparent 50%
  );
`;

const PatternElement = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border: 1px solid var(--color-card-pattern-element);
  border-radius: 50%;
  
  &:nth-of-type(1) { top: 20%; left: 20%; }
  &:nth-of-type(2) { top: 20%; right: 20%; }
  &:nth-of-type(3) { bottom: 20%; left: 20%; }
  &:nth-of-type(4) { bottom: 20%; right: 20%; }
`;

const CardNumber = styled.div`
  font-size: 0.8rem;
  color: var(--color-card-number);
  font-weight: 600;
  z-index: 2;
`;

const PositionLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const CardImagePlaceholder = styled.div`
  width: 80%;
  height: 60%;
  background: var(--color-card-front-bg);
  border: 2px dashed var(--color-card-placeholder-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-card-placeholder-text);
  font-size: 0.75rem;
  
  &::before {
    content: '카드 영상';
  }
`;

const OrientationIndicator = styled.div<{ isReversed: boolean }>`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.isReversed ? 'var(--color-gold-400)' : 'var(--color-accent-400)'};
  color: var(--color-primary-900);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 600;
`;


export default TarotCard;