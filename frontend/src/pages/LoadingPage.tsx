import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import ThemeToggle from '../components/etc/ThemeToggle';
import { trackOnboardingEnter, trackPerformance } from '../utils/analytics';

function LoadingPage() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { sessionId } = useSessionStore();

  // 컴포넌트 마운트 시 GA 추적 및 3초 후 결과 페이지로 이동
  useEffect(() => {
    // GA: 로딩 페이지 진입 추적
    trackOnboardingEnter(7, 'loading');

    const startTime = performance.now();

    const timer = setTimeout(() => {
      const endTime = performance.now();
      const loadingTime = Math.round(endTime - startTime);

      // GA: 로딩 시간 추적
      trackPerformance('loading_page_time', loadingTime);

      if (sessionId) {
        navigate(`/result/${sessionId}`);
      } else {
        // sessionId가 없으면 처음부터 다시 시작
        navigate('/');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, sessionId]);

  return (
    <Container style={globalStyles.container}>
      {/* 테마 토글 버튼 */}
      <ThemeToggle position="fixed" />

      {/* 배경 안개 효과 - 나중에 실제 안개 애니메이션으로 대체 */}
      <BackgroundFog 
        style={{
          background: `radial-gradient(ellipse at center, ${getColor('accent', '400')}15 0%, ${getColor('primary', '900')}90 50%, ${getColor('primary', '900')} 100%)`
        }}
      />

      <Content>
        {/* 로딩 스피너 */}
        <Spinner 
          style={{
            border: `4px solid ${getColor('primary', '700')}`,
            borderTop: `4px solid ${getColor('accent', '400')}`
          }}
        />

        <Title 
          style={{
            ...globalStyles.heading,
            color: getColor('primary', '200')
          }}
        >
          결과를 생성 중입니다
        </Title>
        
        <Description 
          style={{
            ...globalStyles.body,
            color: getColor('primary', '300')
          }}
        >
          선택하신 카드를 바탕으로 AI가 맞춤형 해석을 준비하고 있습니다.<br />
          잠시만 기다려주세요...
        </Description>

        {/* 선택된 카드들 미리보기 */}
        <CardPreview>
          {['과거', '현재', '미래'].map((period, index) => (
            <CardContainer key={index}>
              <Card 
                style={{
                  background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`,
                  boxShadow: `0 4px 20px ${getColor('accent', '400')}40`
                }}
              >
                🃏
              </Card>
              <CardLabel 
                style={{
                  ...globalStyles.body,
                  color: getColor('accent', '300')
                }}
              >
                {period}
              </CardLabel>
            </CardContainer>
          ))}
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

const BackgroundFog = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: pulse 3s ease-in-out infinite;
  
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

const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  line-height: 1.7;
`;

const CardPreview = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 40px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Card = styled.div`
  width: 80px;
  height: 120px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const CardLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`;

export default LoadingPage;