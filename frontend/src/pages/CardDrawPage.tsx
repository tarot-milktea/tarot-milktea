import { useState, useEffect, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import TarotCard from '../components/TarotCard';
import Button from '../components/Button';
import ButtonGroup from '../components/ButtonGroup';
import { calculateAllCardPositions, getResponsiveScale, calculateAnimationDelay, getScreenType } from '../utils/cardLayout';
import { 
  cardContainerVariants, 
  cardVariants, 
  shouldReduceMotion, 
  reducedMotionVariants, 
  reducedMotionCardVariants 
} from '../utils/animations';

interface CardDrawPageProps {
  onNext: () => void;
  onPrev: () => void;
}

function CardDrawPage({ onNext, onPrev }: CardDrawPageProps) {
  const { selectedCards, isRevealing, startReveal, revealCard, resetSelection } = useCardStore();
  const [scale, setScale] = useState(1);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenType, setScreenType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getScreenType();
  });
  
  // 카드 위치 계산을 메모이제이션
  const cardPositions = useMemo(() => calculateAllCardPositions(screenType), [screenType]);
  
  // 애니메이션 variants를 메모이제이션
  const containerVariants = useMemo(() => 
    isReducedMotion ? reducedMotionVariants : cardContainerVariants, 
    [isReducedMotion]
  );
  
  const itemVariants = useMemo(() => 
    isReducedMotion ? reducedMotionCardVariants : cardVariants, 
    [isReducedMotion]
  );

  useEffect(() => {
    // 접근성을 위한 reduced motion 감지
    setIsReducedMotion(shouldReduceMotion());
    
    // 터치 디바이스 감지
    const detectTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };
    
    // 반응형을 위한 리사이즈 핸들러
    const handleResize = () => {
      const containerWidth = window.innerWidth - 40; // padding 고려
      setScale(getResponsiveScale(containerWidth));
      
      // 화면 타입에 따라 상태 업데이트
      const currentScreenType = getScreenType();
      setScreenType(currentScreenType);
    };

    detectTouchDevice(); // 터치 디바이스 감지
    handleResize(); // 초기 설정
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReset = () => {
    resetSelection();
  };

  const handleConfirm = () => {
    if (selectedCards.length === 3) {
      startReveal();
      
      // 순차적으로 카드 뒤집기
      selectedCards.forEach((card, index) => {
        setTimeout(() => {
          revealCard(card.id);
        }, index * 800);
      });
    }
  };

  return (
    <Container>
      <Character>
        🔮
      </Character>

      <Title>
        카드를 선택해주세요
      </Title>
      
      <Description>
        72장의 카드 중 3장을 선택하시면 과거, 현재, 미래를 알려드립니다
      </Description>
      
      {/* 접근성을 위한 숨겨진 설명 */}
      <div id="card-selection-description" style={{ position: 'absolute', left: '-10000px' }}>
        곡선으로 배치된 72장의 타로 카드가 있습니다. 카드를 클릭하거나 탭하여 3장을 선택하세요. 
        선택된 카드는 각각 과거, 현재, 미래를 나타냅니다. {selectedCards.length}/3장 선택됨.
      </div>

      <CardSection>
        {!isRevealing ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="grid"
            aria-label="타로 카드 선택 영역"
            aria-describedby="card-selection-description"
            style={{
              position: 'relative',
              width: '100%',
              height: '600px', // 높이 증가로 위로 이동된 카드들 수용
              maxWidth: '1200px',
              margin: '0 auto 80px auto', // 하단 마진 추가로 버튼과 안전 거리 확보
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(ellipse at center, rgba(255, 237, 77, 0.05) 0%, rgba(255, 237, 77, 0.02) 50%, transparent 100%)',
              borderRadius: '20px',
              transform: `scale(${scale})`,
            }}
          >
            {cardPositions.map((position, index) => {
              const cardId = index + 1;
              
              return (
                <motion.div
                  key={cardId}
                  variants={itemVariants}
                  custom={{ 
                    position: position,
                    delay: calculateAnimationDelay(index)
                  }}
                  initial="hidden"
                  animate="visible"
                  whileHover={!isReducedMotion && !isTouchDevice ? "hover" : undefined}
                  whileTap={!isReducedMotion ? "tap" : undefined}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    transformOrigin: 'center',
                    zIndex: 1,
                    padding: '4px',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TarotCard cardId={cardId} size="small" />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <RevealSection>
            <RevealTitle>선택하신 카드입니다</RevealTitle>
            <RevealGrid>
              {selectedCards.map((selectedCard) => (
                <RevealCardContainer key={selectedCard.id}>
                  <TarotCard cardId={selectedCard.id} size="large" />
                </RevealCardContainer>
              ))}
            </RevealGrid>
            <ButtonGroup gap="large">
              <Button variant="ghost" size="medium" onClick={onPrev}>
                이전
              </Button>
              <Button variant="secondary" size="medium" onClick={handleReset}>
                다시 선택하기
              </Button>
              <Button variant="primary" size="medium" onClick={onNext}>
                결과 해석하기
              </Button>
            </ButtonGroup>
          </RevealSection>
        )}
      </CardSection>

      {!isRevealing && (
        <Hint 
          onClick={selectedCards.length === 3 ? handleConfirm : undefined}
          isClickable={selectedCards.length === 3}
        >
          <HintText>
            {selectedCards.length < 3 
              ? `💡 카드를 클릭하면 선택됩니다. ${selectedCards.length}/3 선택됨`
              : '🎉 3장이 모두 선택되었습니다! 여기를 클릭하여 카드를 뒤집어주세요.'
            }
          </HintText>
        </Hint>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
`;

const Character = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin-bottom: 40px;
  background: linear-gradient(135deg, 
    var(--color-accent-400) 0%, 
    var(--color-accent-600) 100%
  );
  box-shadow: 0 0 50px var(--color-accent-400);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--color-primary-200);
  font-weight: 700;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
  color: var(--color-primary-300);
  line-height: 1.6;
`;

const CardSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;


const RevealSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
`;

const RevealTitle = styled.h2`
  font-size: 2rem;
  color: var(--color-text-accent);
  margin: 0;
  font-weight: 600;
`;

const RevealGrid = styled.div`
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  min-height: 350px;
`;

const RevealCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;


const Hint = styled.div<{ isClickable: boolean }>`
  margin-top: 30px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 237, 77, 0.15);
  border: 1px solid var(--color-accent-400);
  transition: all 0.3s ease;
  
  ${props => props.isClickable && `
    cursor: pointer;
    background: rgba(255, 237, 77, 0.25);
    border: 2px solid var(--color-accent-400);
    
    &:hover {
      background: rgba(255, 237, 77, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--color-accent-400);
    }
    
    &:active {
      transform: translateY(0px);
    }
  `}
`;

const HintText = styled.p`
  margin: 0;
  color: var(--color-text-accent);
  line-height: 1.6;
  font-weight: 500;
`;


export default CardDrawPage;