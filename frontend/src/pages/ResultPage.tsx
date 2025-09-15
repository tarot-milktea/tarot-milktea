import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import { useCardStore } from '../store/cardStore';
import ThemeToggle from '../components/etc/ThemeToggle';
import CardVideo from '../components/TarotCard/CardVideo';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';

interface TarotResult {
  cards: Array<{
    id: number;
    position: 'past' | 'present' | 'future';
    orientation: 'upright' | 'reversed';
  }>;
  nickname?: string;
  topic?: string;
  question?: string;
}

function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { getColor } = useColors();
  const { resetSelection } = useCardStore();
  const [result, setResult] = useState<TarotResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) {
      // localStorage에서 결과 데이터 가져오기
      const savedResult = localStorage.getItem(`tarot_${resultId}`);
      
      if (savedResult) {
        try {
          const parsedResult = JSON.parse(savedResult);
          setResult(parsedResult);
        } catch (error) {
          console.error('결과 파싱 실패:', error);
          navigate('/', { replace: true });
        }
      } else {
        // 결과가 없으면 홈으로 리다이렉트
        navigate('/', { replace: true });
      }
    }
    setLoading(false);
  }, [resultId, navigate]);

  const shareResult = () => {
    if (resultId) {
      const shareUrl = `${window.location.origin}/result/${resultId}`;
      
      if (navigator.share) {
        navigator.share({
          title: '🔮 내 타로 결과',
          text: '타로 인사이트로 본 내 운세를 확인해보세요!',
          url: shareUrl,
        });
      } else {
        // Web Share API 지원하지 않으면 클립보드에 복사
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('링크가 클립보드에 복사되었습니다!');
        });
      }
    }
  };

  const downloadVideo = () => {
    // TODO: 실제 영상 다운로드 구현
    alert('영상 다운로드 기능은 준비중입니다.');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>결과를 불러오는 중...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!result) {
    return (
      <ErrorContainer>
        <ErrorText>결과를 찾을 수 없습니다.</ErrorText>
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            resetSelection(); // 카드 선택 상태 초기화
            navigate('/');
          }}
        >
          새로운 타로 보기
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      {/* 테마 토글 버튼 */}
      <ThemeToggle position="absolute" />

      <Content>
        <Title>🔮 타로 해석 결과</Title>

        {/* 영상 플레이어 영역 - 나중에 실제 영상 플레이어로 대체 */}
        <VideoPlayerSection>
          <PlayIcon>▶️</PlayIcon>
          <VideoLabel>AI가 생성한 맞춤형 타로 해석 영상</VideoLabel>
        </VideoPlayerSection>

        {/* 선택된 카드들 */}
        <CardGrid>
          {result.cards && result.cards.map((card, index) => {
            const positions = ['과거', '현재', '미래'];
            return (
              <CardInfo key={card.id}>
                <CardVideoContainer>
                  <CardVideo 
                    cardId={card.id}
                    isReversed={card.orientation === 'reversed'}
                    size="large"
                    autoPlay={true}
                    context="result-page"
                  />
                </CardVideoContainer>
                
                <CardPeriod>
                  {positions[index] || '미래'}
                </CardPeriod>
                
                <OrientationBadge isReversed={card.orientation === 'reversed'}>
                  {card.orientation === 'upright' ? '정방향' : '역방향'}
                </OrientationBadge>
                
                <CardMeaning>
                  {card.orientation === 'reversed' 
                    ? '역방향 해석이 필요한 카드입니다' 
                    : '정방향의 긍정적 의미를 담고 있습니다'
                  }
                </CardMeaning>
              </CardInfo>
            );
          })}
        </CardGrid>

        {/* 액션 버튼들 */}
        <ButtonGroup gap="large" align="center">
          <Button 
            variant="primary"
            size="large"
            onClick={() => {
              resetSelection(); // 카드 선택 상태 초기화
              navigate('/');
            }}
          >
            다시 타로보기
          </Button>
          
          <Button 
            variant="secondary"
            size="large"
            onClick={shareResult}
          >
            결과 공유하기
          </Button>
          
          <Button 
            variant="ghost"
            size="large"
            onClick={downloadVideo}
          >
            영상 다운로드
          </Button>
        </ButtonGroup>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  padding: 40px 20px;
  position: relative;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary-200);
  text-align: center;
  margin: 0;
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.p`
  color: var(--color-primary-300);
  font-size: 1.2rem;
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

const ErrorText = styled.p`
  color: var(--color-primary-300);
  font-size: 1.2rem;
  margin: 0;
`;

const VideoPlayerSection = styled.div`
  background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
  border: 2px solid rgba(255, 237, 77, 0.4);
  border-radius: 16px;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
`;

const PlayIcon = styled.div`
  font-size: 4rem;
  color: var(--color-accent-400);
  text-shadow: 0 0 20px var(--color-accent-400);
`;

const VideoLabel = styled.p`
  color: var(--color-primary-300);
  font-size: 1.1rem;
  margin: 0;
  text-align: center;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const CardInfo = styled.div`
  background: linear-gradient(135deg, rgba(30, 30, 46, 0.9) 0%, rgba(45, 45, 69, 0.5) 100%);
  border: 1px solid var(--color-primary-600);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const CardVideoContainer = styled.div`
  width: 200px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const CardPeriod = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0;
`;

const OrientationBadge = styled.div<{ isReversed: boolean }>`
  background: ${props => props.isReversed ? 'var(--color-gold-400)' : 'var(--color-accent-400)'};
  color: var(--color-primary-900);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${props => props.isReversed ? 'var(--color-gold-600)' : 'var(--color-accent-600)'};
`;

const CardMeaning = styled.p`
  color: var(--color-primary-400);
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 280px;
`;

export default ResultPage;