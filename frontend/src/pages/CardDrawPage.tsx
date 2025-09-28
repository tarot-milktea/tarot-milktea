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
import { calculateAllCardPositions, getResponsiveScale, calculateAnimationDelay, getScreenType, calculateLayoutHeight } from '../utils/cardLayout';
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
import ReaderVideo from '../components/common/ReaderVideo/ReaderVideo';
import { useTTS } from '../hooks/useTTS';

// 리더 타입별 로컬 비디오 매핑
const getLocalVideoUrl = (readerType: string): string | null => {
  const videoMap: Record<string, string> = {
    'f': '/f.webm',
    't': '/t.webm',
    'tf': '/tf.webm'
  };
  return videoMap[readerType] || null;
};

function CardDrawPage() {
  const navigate = useNavigate();
  const { selectedCards, isRevealing, startReveal, revealCard } = useCardStore();
  const { predefinedCards, submitSessionData, selectedReader } = useSessionStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();
  const [scale, setScale] = useState(1);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenType, setScreenType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getScreenType();
  });

  // TTS 훅
  const {
    requestTTSStream,
    stopAudio,
    isPlaying: ttsIsPlaying,
    isLoading: ttsLoading,
  } = useTTS({
    autoPlay: true,
    onComplete: () => console.log("CardDraw TTS completed"),
    onError: (error) => console.error("CardDraw TTS error:", error),
  });
  
  // 카드 위치 계산을 메모이제이션
  const cardPositions = useMemo(() => calculateAllCardPositions(screenType), [screenType]);

  // 레이아웃 높이 계산을 메모이제이션
  const layoutHeight = useMemo(() => calculateLayoutHeight(screenType), [screenType]);
  
  // 애니메이션 variants를 메모이제이션
  const containerVariants = useMemo(() => 
    isReducedMotion ? reducedMotionVariants : cardContainerVariants, 
    [isReducedMotion]
  );
  
  const itemVariants = useMemo(() => 
    isReducedMotion ? reducedMotionCardVariants : cardVariants, 
    [isReducedMotion]
  );

  // 컴포넌트 마운트 시 세션 데이터 제출 및 TTS 재생
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

    // TTS 재생
    const playTTS = async () => {
      try {
        await requestTTSStream(
          "운명이 당신을 부르고 있습니다. 카드 세 장을 뽑아주세요.",
          "nova"
        );
      } catch (error) {
        console.error("CardDraw TTS 재생 실패:", error);
      }
    };

    submitSession();
    playTTS();
  }, [submitSessionData, setCurrentPage, requestTTSStream]);

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
        {selectedReader && getLocalVideoUrl(selectedReader.type) ? (
          <ReaderVideo
            videoUrl={getLocalVideoUrl(selectedReader.type)!}
            readerName={selectedReader.name}
            readerType={selectedReader.type}
            autoPlay={true}
            isPlaying={true}
            size="large"
            shape="rectangle"
            showFallback={true}
            fallbackImageUrl={selectedReader.imageUrl}
          />
        ) : selectedReader ? (
          <CharacterImage src={selectedReader.imageUrl} alt={selectedReader.name} />
        ) : (
          "🔮"
        )}
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
              height: `${layoutHeight * scale - 110}px`, // 실제 카드 배치에 필요한 높이만 사용
              maxWidth: screenType === 'tablet' ? '95vw' : '1200px', // 태블릿에서 좌우 여백 더 줄임
              margin: `0 auto ${Math.max(40, 80 * scale)}px auto`, // 하단 마진도 스케일에 비례하여 조정
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
  padding: 40px 20px 60px 20px; // 상단 패딩 줄이고 하단 패딩은 유지
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);

  // 모바일에서 패딩 조정 - 상하 여백 더 줄임
  @media (max-width: 768px) {
    padding: 0px 16px 20px 16px;
  }

  // 태블릿에서 패딩 조정 - 좌우 여백 더 줄임
  @media (min-width: 769px) and (max-width: 1023px) {
    padding: 30px 8px 50px 8px;
  }
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

  // 모바일에서 크기 조정 - 마진 더 줄임
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    font-size: 2.5rem;
    margin-bottom: 10px;
    box-shadow: 0 0 30px var(--color-accent-400);
  }

  // 태블릿에서 크기 조정
  @media (min-width: 769px) and (max-width: 1023px) {
    width: 160px;
    height: 160px;
    font-size: 3rem;
    margin-bottom: 30px;
    box-shadow: 0 0 40px var(--color-accent-400);
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--color-primary-200);
  font-weight: 700;

  // 모바일에서 폰트 크기 조정 - 마진 더 줄임
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }

  // 태블릿에서 폰트 크기 조정
  @media (min-width: 769px) and (max-width: 1023px) {
    font-size: 2.2rem;
    margin-bottom: 18px;
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 25px;
  max-width: 600px;
  color: var(--color-primary-300);
  line-height: 1.6;

  // 모바일에서 폰트 크기 조정 - 마진 더 줄임
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 10px;
    max-width: 90%;
    line-height: 1.5;
  }

  // 태블릿에서 폰트 크기 조정
  @media (min-width: 769px) and (max-width: 1023px) {
    font-size: 1.1rem;
    margin-bottom: 22px;
    max-width: 95%; // 좌우 여백 더 줄임
  }
`;

const MysticText = styled.p`
  font-size: 1rem;
  margin-bottom: 40px;
  max-width: 500px;
  color: var(--color-accent-300);
  line-height: 1.5;
  font-style: italic;
  text-shadow: 0 0 10px var(--color-accent-400);

  // 모바일에서 마진 더 줄임
  @media (max-width: 768px) {
    margin-bottom: 15px;
    max-width: 90%;
    font-size: 0.9rem;
  }

  // 태블릿에서 좌우 여백 줄임
  @media (min-width: 769px) and (max-width: 1023px) {
    max-width: 95%;
  }
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
  margin-top: 60px;
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

const CharacterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

export default CardDrawPage;