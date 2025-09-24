import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import { trackOnboardingEnter, trackPerformance } from '../utils/analytics';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';

// 신비로운 타로 명언들
const MYSTICAL_QUOTES = [
  '운명은 카드에 숨겨져 있습니다',
  '별들이 당신의 이야기를 들려줍니다',
  '카드가 우주의 비밀을 속삭입니다',
  '시간의 흐름 속에서 진실을 찾고 있습니다',
  '과거와 미래가 만나는 순간입니다',
  '운명의 실이 엮어지고 있습니다',
  '신비로운 힘이 당신을 인도합니다',
  '타로의 지혜가 깨어나고 있습니다',
  '우주가 당신에게 답을 보내고 있습니다',
  '마법의 순간이 펼쳐지고 있습니다'
];

function LoadingPage() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { sessionId } = useSessionStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();

  // 명언 로테이션 상태
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  // 디자인용 진행 상태 (실제 SSE 대신 시뮬레이션)
  const [step, setStep] = useState(0);
  const [flippedCards, setFlippedCards] = useState([false, false, false]);

  // 명언 로테이션 효과
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % MYSTICAL_QUOTES.length);
        setQuoteVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(quoteInterval);
  }, []);

  // 카드 애니메이션 시뮬레이션 (3초 동안)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(prev => {
        const nextStep = prev + 1;
        if (nextStep === 1) setFlippedCards([true, false, false]);
        else if (nextStep === 2) setFlippedCards([true, true, false]);
        else if (nextStep === 3) setFlippedCards([true, true, true]);
        return nextStep;
      });
    }, 800);

    return () => {
      clearInterval(stepInterval);
    };
  }, []);

  // 컴포넌트 마운트 시 GA 추적 및 즉시 결과 페이지로 이동
  useEffect(() => {
    // 진행률 상태 업데이트 (loading은 card-draw와 같은 단계)
    setCurrentPage('loading');
    trackOnboardingEnter(7, 'loading');
    const startTime = performance.now();
    const loadingTime = Math.round(performance.now() - startTime);
    trackPerformance('loading_page_time', loadingTime);

    if (sessionId) {
      navigate(`/result/${sessionId}`);
    } else {
      navigate('/');
    }
  }, [navigate, sessionId]);

  // 현재 진행 상황에 따른 메시지
  const getStatusMessage = () => {
    switch (step) {
      case 0:
        return '결과를 생성 중입니다';
      case 1:
        return '과거의 카드를 해석하고 있습니다';
      case 2:
        return '현재의 카드를 해석하고 있습니다';
      case 3:
        return '미래의 카드를 해석하고 있습니다';
      default:
        return '결과를 생성 중입니다';
    }
  };


  return (
    <Container style={globalStyles.container}>
      <ProgressBar currentStep={getCurrentStep()} totalSteps={getTotalSteps()} />
      {/* 떠다니는 별들 배경 */}
      <StarField>
        {Array.from({ length: 12 }).map((_, i) => (
          <Star
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </StarField>

      {/* 배경 그라데이션 */}
      <BackgroundFog
        style={{
          background: `radial-gradient(ellipse at center, ${getColor('accent', '400')}15 0%, ${getColor('primary', '900')}90 50%, ${getColor('primary', '900')} 100%)`
        }}
      />

      <Content>
        {/* 신비로운 로딩 인디케이터 */}
        <MysticLoader>
          <LoaderRing
            style={{
              borderColor: `${getColor('accent', '400')}30`,
              borderTopColor: getColor('accent', '400')
            }}
          />
          <LoaderCenter
            style={{
              background: `linear-gradient(45deg, ${getColor('accent', '400')}, ${getColor('accent', '600')})`,
              boxShadow: `0 0 20px ${getColor('accent', '400')}60`
            }}
          >
            ✨
          </LoaderCenter>
        </MysticLoader>


        {/* 상태 메시지 */}
        <Title
          style={{
            ...globalStyles.heading,
            color: getColor('primary', '200')
          }}
        >
          {getStatusMessage()}
        </Title>

        {/* 신비로운 명언 */}
        <Quote
          visible={quoteVisible}
          style={{
            ...globalStyles.body,
            color: getColor('accent', '300')
          }}
        >
          {MYSTICAL_QUOTES[currentQuoteIndex]}
        </Quote>

        {/* 개선된 카드 미리보기 */}
        <CardPreview>
          {['과거', '현재', '미래'].map((period, index) => {
            const isProcessed = flippedCards[index];

            return (
              <CardContainer key={index}>
                <TarotCard
                  flipped={isProcessed}
                  delay={index * 0.5}
                  style={{
                    '--glow-color': isProcessed ? getColor('accent', '400') : getColor('primary', '600')
                  } as React.CSSProperties}
                >
                  <CardBack
                    style={{
                      background: `linear-gradient(135deg, ${getColor('primary', '600')} 0%, ${getColor('primary', '700')} 100%)`,
                      borderColor: getColor('primary', '500')
                    }}
                  >
                    <CardPattern>✦</CardPattern>
                  </CardBack>
                  <CardFront
                    style={{
                      background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`,
                      borderColor: getColor('accent', '400')
                    }}
                  >
                    <CardSymbol>🔮</CardSymbol>
                  </CardFront>
                </TarotCard>
                <CardLabel
                  style={{
                    ...globalStyles.body,
                    color: isProcessed ? getColor('accent', '300') : getColor('primary', '400')
                  }}
                >
                  {period}
                </CardLabel>
              </CardContainer>
            );
          })}
        </CardPreview>
      </Content>
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
  position: relative;
  overflow: hidden;
`;

const StarField = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Star = styled.div`
  position: absolute;
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  animation: twinkle linear infinite;

  @keyframes twinkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

const BackgroundFog = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: pulse 4s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const MysticLoader = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const LoaderRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid;
  border-radius: 50%;
  animation: spin 3s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoaderCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  animation: glow 2s ease-in-out infinite;

  @keyframes glow {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
  }
`;


const Title = styled.h1`
  font-size: 2.2rem;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
`;

const Quote = styled.p<{ visible: boolean }>`
  font-size: 1.1rem;
  font-style: italic;
  margin: 0;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
`;

const CardPreview = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 40px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const TarotCard = styled.div<{ flipped: boolean; delay: number }>`
  position: relative;
  width: 90px;
  height: 130px;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
  animation: ${props => props.flipped ? 'cardFlip' : 'none'} 0.8s ease;
  animation-delay: ${props => props.delay}s;
  filter: drop-shadow(0 4px 20px var(--glow-color, #666));

  @keyframes cardFlip {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(90deg); }
    100% { transform: rotateY(180deg); }
  }
`;

const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
`;

const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transform: rotateY(180deg);
`;

const CardPattern = styled.div`
  font-size: 2rem;
  color: #888;
`;

const CardSymbol = styled.div`
  font-size: 2.5rem;
`;

const CardLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.3s ease;
`;

export default LoadingPage;