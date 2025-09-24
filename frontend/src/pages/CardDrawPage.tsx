import { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';
import { useSessionStore } from '../store/sessionStore';
import TarotCard from '../components/TarotCard/TarotCard';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
// import ThemeToggle from '../components/etc/ThemeToggle';
import { calculateAllCardPositions, getResponsiveScale, calculateAnimationDelay, getScreenType } from '../utils/cardLayout';
import {
  cardContainerVariants,
  cardVariants,
  shouldReduceMotion,
  reducedMotionVariants,
  reducedMotionCardVariants
} from '../utils/animations';
import { trackOnboardingEnter, trackCardEvent, trackPerformance } from '../utils/analytics';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';

function CardDrawPage() {
  const navigate = useNavigate();
  const { selectedCards, isRevealing, startReveal, revealCard } = useCardStore();
  const { predefinedCards, submitSessionData } = useSessionStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();
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

  // 컴포넌트 마운트 시 세션 데이터 제출
  useEffect(() => {
    // 진행률 상태 업데이트
    setCurrentPage('card-draw');
    // GA: 카드 뽑기 페이지 진입 추적
    trackOnboardingEnter(6, 'card_selection');

    const submitSession = async () => {
      const startTime = performance.now();
      try {
        await submitSessionData();

        const endTime = performance.now();
        // GA: 세션 데이터 제출 성능 추적
        trackPerformance('session_submit_time', Math.round(endTime - startTime));

      } catch (error) {
        console.error('CardDrawPage: 세션 데이터 제출 실패:', error);
      }
    };

    submitSession();
  }, [submitSessionData]);

  useEffect(() => {
    // 접근성을 위한 reduced motion 감지
    setIsReducedMotion(shouldReduceMotion());
    
    // 터치 디바이스 감지
    const detectTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        ((navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0
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
      <ProgressBar currentStep={getCurrentStep()} totalSteps={getTotalSteps()} />
      {/* 테마 토글 버튼 */}
      {/* <ThemeToggle position="fixed" /> */}

      <Character>
        🔮
      </Character>

      <Title>
        운명이 당신을 부르고 있습니다
      </Title>

      <Description>
        우주의 신비가 당신의 고민을 들었습니다.<br/>
        이미 선택된 운명의 세 장이 기다리고 있어요.<br/>
        카드를 선택하시면 과거, 현재, 미래의 진실이 드러납니다.
      </Description>

      <MysticText>
        🌙 당신의 내면 깊은 곳에서 울려오는 직감을 따라주세요 🌙
      </MysticText>
      
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

              // 선택된 카드인지 확인하고 해당하는 predefinedCard 찾기
              const selectedCardIndex = selectedCards.findIndex(card => card.id === cardId);
              const predefinedCard = selectedCardIndex !== -1 ? predefinedCards[selectedCardIndex] : undefined;

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
                  <TarotCard
                    cardId={cardId}
                    size="small"
                    predefinedCard={predefinedCard}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <RevealSection>
            <RevealTitle>🔮 운명의 세 장이 드러났습니다 🔮</RevealTitle>
            <RevealSubtitle>
              당신이 선택한 것이 아닙니다. 운명이 당신을 선택한 것입니다.
            </RevealSubtitle>
            <RevealGrid>
              {selectedCards.map((selectedCard, index) => {
                // 미리 정해진 카드 정보를 TarotCard에 props로 전달
                const predefinedCard = predefinedCards[index];

                return (
                  <RevealCardContainer key={selectedCard.id}>
                    <TarotCard
                      cardId={selectedCard.id}
                      size="large"
                      predefinedCard={predefinedCard}
                    />
                  </RevealCardContainer>
                );
              })}
            </RevealGrid>
            <ButtonGroup gap="large">
              {/* <Button variant="ghost" size="medium" onClick={onPrev}>
                이전
              </Button> */}
              {/* <Button variant="secondary" size="medium" onClick={handleReset}>
                다시 선택하기
              </Button> */}
              <Button variant="primary" size="medium" onClick={() => {
                // GA: 카드 선택 완료 추적
                trackCardEvent('complete', {
                  total_cards_selected: selectedCards.length,
                  has_past_card: selectedCards.some(card => card.position === 'past'),
                  has_present_card: selectedCards.some(card => card.position === 'present'),
                  has_future_card: selectedCards.some(card => card.position === 'future')
                });

                navigate('/onboarding/loading');
              }}>
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
              ? `✨ 당신의 마음이 이끄는 카드를 선택하세요 ${selectedCards.length}/3 ✨`
              : '🌟 완벽합니다! 운명의 문이 열렸습니다. 여기를 클릭하여 진실을 마주하세요 🌟'
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
  margin-bottom: 25px;
  max-width: 600px;
  color: var(--color-primary-300);
  line-height: 1.6;
`;

const MysticText = styled.p`
  font-size: 1rem;
  margin-bottom: 40px;
  max-width: 500px;
  color: var(--color-accent-300);
  line-height: 1.5;
  font-style: italic;
  text-shadow: 0 0 10px var(--color-accent-400);
`;

const RevealSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--color-accent-300);
  margin: -20px 0 20px 0;
  font-style: italic;
  text-shadow: 0 0 8px var(--color-accent-400);
  max-width: 400px;
  line-height: 1.5;
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