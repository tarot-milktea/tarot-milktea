import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useCardStore } from '../store/cardStore';
import { useSessionStore } from '../store/sessionStore';
import { useResultStore } from '../store/resultStore';
import { showToast } from '../components/common/Toast';
import ThemeToggle from '../components/etc/ThemeToggle';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
import CardVideo from '../components/TarotCard/CardVideo';
import { trackPageView, trackResultInteraction, trackTimeOnPage, trackError } from '../utils/analytics';

function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { resetSelection } = useCardStore();
  const { clearSession, restoreFromStorage, predefinedCards, fetchPredefinedCards } = useSessionStore();
  const {
    setSessionId,
    resetResult,
    error: resultError,
    setCardInterpretation,
    setSummary,
    setAdviceImage,
    setProcessingStatus,
    cardInterpretations,
    summary,
    fortuneScore,
    adviceImageUrl
  } = useResultStore();
  const [loading, setLoading] = useState(true);
  const [pageStartTime] = useState(performance.now());

  useEffect(() => {
    if (resultId) {
      // Initialize result store with session ID
      setSessionId(resultId);

      // Restore session data from sessionStorage
      restoreFromStorage();

      // GA: 결과 페이지 조회 추적
      trackPageView(`/result/${resultId}`, '타로 결과 페이지');
      trackResultInteraction('view_complete', {
        result_id: resultId
      });

      setLoading(false);
    } else {
      navigate('/', { replace: true });
    }

    // Cleanup on unmount
    return () => {
      // GA: 페이지 체류 시간 추적
      const timeOnPage = Math.round(performance.now() - pageStartTime);
      trackTimeOnPage('result_page', timeOnPage);

      resetResult();
    };
  }, [resultId, navigate, setSessionId, resetResult, restoreFromStorage, pageStartTime]);

  /**
   * TODO: 임시 해결책 - 백엔드 API 수정 후 삭제 예정
   *
   * 문제: 공유 링크로 접속한 사용자는 sessionStorage에 저장된 predefinedCards 데이터에 접근할 수 없음
   * 임시 해결: predefinedCards가 없으면 별도 API 호출로 카드 정보 가져오기
   *
   * 백엔드 수정 완료 시 이 useEffect와 관련 로직을 모두 삭제하고,
   * 결과 API 응답에 predefinedCards를 포함하도록 수정
   */
  useEffect(() => {
    if (resultId && (!predefinedCards || predefinedCards.length === 0)) {
      const loadPredefinedCards = async () => {
        try {
          await fetchPredefinedCards();
        } catch (error) {
          console.error('Failed to fetch predefined cards for shared link:', error);
          // 카드 정보를 가져오지 못해도 텍스트는 보여줄 수 있으므로 에러를 throw하지 않음
        }
      };

      loadPredefinedCards();
    }
  }, [resultId, predefinedCards, fetchPredefinedCards]);

  // Polling for result updates
  useEffect(() => {
    if (!resultId) return;

    const fetchResult = async () => {
      try {
        const response = await fetch(`https://j13a601.p.ssafy.io/api/sessions/${resultId}/result`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Update result store with fetched data
        if (data.interpretations?.past) {
          setCardInterpretation('past', data.interpretations.past);
        }
        if (data.interpretations?.present) {
          setCardInterpretation('present', data.interpretations.present);
        }
        if (data.interpretations?.future) {
          setCardInterpretation('future', data.interpretations.future);
        }
        if (data.interpretations?.summary) {
          setSummary(data.interpretations.summary, data.fortuneScore);
        }
        if (data.resultImage?.url) {
          setAdviceImage(data.resultImage.url, data.resultImage.description);
        }
        if (data.status) {
          setProcessingStatus(data.status, `상태: ${data.status}`, 100);
        }

        // Stop polling if completed
        if (data.status === 'COMPLETED') {
          return true; // Signal to stop polling
        }

        return false; // Continue polling
      } catch {
        return false; // Continue polling on error
      }
    };

    // Initial fetch
    fetchResult().then((shouldStop) => {
      if (shouldStop) return;

      // Set up interval for polling
      const intervalId = setInterval(async () => {
        const shouldStop = await fetchResult();
        if (shouldStop) {
          clearInterval(intervalId);
        }
      }, 5000); // Poll every 5 seconds

      // Cleanup interval on unmount
      return () => {
        clearInterval(intervalId);
      };
    });
  }, [resultId, setCardInterpretation, setSummary, setAdviceImage, setProcessingStatus]);

  const shareResult = async () => {
    if (resultId) {
      const shareUrl = `${window.location.origin}/result/${resultId}`;

      // GA: 공유 버튼 클릭 추적
      trackResultInteraction('share', {
        result_id: resultId,
        share_method: 'navigator' in window && 'share' in navigator ? 'native' : 'clipboard'
      });

      try {
        if (navigator.share) {
          await navigator.share({
            title: '🔮 내 타로 결과',
            text: '타로 인사이트로 본 내 운세를 확인해보세요!',
            url: shareUrl,
          });
        } else {
          // Web Share API 지원하지 않으면 클립보드에 복사
          await navigator.clipboard.writeText(shareUrl);
          showToast.success('링크가 클립보드에 복사되었습니다! 📋');
        }
      } catch {
        showToast.error('공유에 실패했습니다');
        trackError('share_failed', '공유 실패', 'result_page');
      }
    }
  };

  const handleRestartTarot = () => {
    // GA: 새로운 타로 보기 클릭 추적
    trackResultInteraction('restart', {
      result_id: resultId || 'unknown'
    });

    // 모든 상태 초기화
    resetSelection();    // 카드 스토어 초기화
    clearSession();      // 세션 스토어 초기화 (sessionStorage 포함)
    resetResult();       // 결과 스토어 초기화
    navigate('/');       // 온보딩 페이지로 이동
  };


  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>결과를 불러오는 중...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!resultId) {
    return (
      <ErrorContainer>
        <ErrorText>유효하지 않은 결과 ID입니다.</ErrorText>
        <Button
          variant="primary"
          size="large"
          onClick={handleRestartTarot}
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
        <Header>
          <Title>🔮 타로 해석 결과</Title>
          <Subtitle>AI가 실시간으로 생성하는 맞춤형 타로 해석</Subtitle>
        </Header>

        {/* 오류 표시 */}
        {resultError && (
          <ErrorStatus>
            <StatusMessage variant="error">
              <StatusIcon>❌</StatusIcon>
              {resultError}
            </StatusMessage>
          </ErrorStatus>
        )}

        {/* 카드 해석 - 가로 배치 */}
        <CardsGrid>
          <CardSection>
            <CardTitle>🕰️ 과거</CardTitle>
            {predefinedCards?.[0] && (
              <CardVideoContainer>
                <div className="card-video-wrapper">
                  <CardVideo
                    cardId={predefinedCards[0].cardId}
                    isReversed={predefinedCards[0].orientation === 'reversed'}
                    size="large"
                    autoPlay={true}
                    context="result-page"
                    videoUrl={predefinedCards[0].videoUrl}
                    cardName={predefinedCards[0].nameKo}
                  />
                </div>
                <CardInfo>
                  <CardName>{predefinedCards[0].nameKo}</CardName>
                  <OrientationBadge isReversed={predefinedCards[0].orientation === 'reversed'}>
                    {predefinedCards[0].orientation === 'upright' ? '정방향' : '역방향'}
                  </OrientationBadge>
                </CardInfo>
              </CardVideoContainer>
            )}
            <CardContent>
              {cardInterpretations.past?.interpretation || '과거 해석을 불러오는 중...'}
            </CardContent>
          </CardSection>

          <CardSection>
            <CardTitle>⭐ 현재</CardTitle>
            {predefinedCards?.[1] && (
              <CardVideoContainer>
                <CardVideo
                  cardId={predefinedCards[1].cardId}
                  isReversed={predefinedCards[1].orientation === 'reversed'}
                  size="small"
                  autoPlay={true}
                  context="result-page"
                  videoUrl={predefinedCards[1].videoUrl}
                  cardName={predefinedCards[1].nameKo}
                />
                <CardInfo>
                  <CardName>{predefinedCards[1].nameKo}</CardName>
                  <OrientationBadge isReversed={predefinedCards[1].orientation === 'reversed'}>
                    {predefinedCards[1].orientation === 'upright' ? '정방향' : '역방향'}
                  </OrientationBadge>
                </CardInfo>
              </CardVideoContainer>
            )}
            <CardContent>
              {cardInterpretations.present?.interpretation || '현재 해석을 불러오는 중...'}
            </CardContent>
          </CardSection>

          <CardSection>
            <CardTitle>🔮 미래</CardTitle>
            {predefinedCards?.[2] && (
              <CardVideoContainer>
                <CardVideo
                  cardId={predefinedCards[2].cardId}
                  isReversed={predefinedCards[2].orientation === 'reversed'}
                  size="small"
                  autoPlay={true}
                  context="result-page"
                  videoUrl={predefinedCards[2].videoUrl}
                  cardName={predefinedCards[2].nameKo}
                />
                <CardInfo>
                  <CardName>{predefinedCards[2].nameKo}</CardName>
                  <OrientationBadge isReversed={predefinedCards[2].orientation === 'reversed'}>
                    {predefinedCards[2].orientation === 'upright' ? '정방향' : '역방향'}
                  </OrientationBadge>
                </CardInfo>
              </CardVideoContainer>
            )}
            <CardContent>
              {cardInterpretations.future?.interpretation || '미래 해석을 불러오는 중...'}
            </CardContent>
          </CardSection>
        </CardsGrid>

        {/* 종합 해석 및 점수 */}
        <SummaryContainer>
          <SummaryHeader>
            <SummaryTitle>📋 종합 해석</SummaryTitle>
            {fortuneScore !== null && (
              <ScoreDisplay>
                <ScoreNumber>{fortuneScore}</ScoreNumber>
                <ScoreLabel>/100</ScoreLabel>
              </ScoreDisplay>
            )}
          </SummaryHeader>

          <SummaryText>
            {summary || '종합 해석을 생성하는 중...'}
          </SummaryText>
        </SummaryContainer>

        {/* 결과 이미지 */}
        {adviceImageUrl && (
          <ImageContainer>
            <ImageTitle>🎨 맞춤 조언 이미지</ImageTitle>
            <ResultImage src={adviceImageUrl} alt="타로 조언 이미지" />
          </ImageContainer>
        )}

        {/* 액션 버튼들 */}
        <ButtonGroup gap="large" align="center">
          <Button
            variant="primary"
            size="large"
            onClick={handleRestartTarot}
          >
            새로운 타로 보기
          </Button>

          <Button
            variant="secondary"
            size="large"
            onClick={shareResult}
          >
            결과 공유하기
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
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary-200);
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--color-primary-400);
  margin: 0;
  line-height: 1.4;
`;

const ErrorStatus = styled.div`
  margin-bottom: 16px;
`;

const StatusMessage = styled.div<{ variant: 'error' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--color-error-900);
  border: 1px solid var(--color-error-600);
  color: var(--color-error-200);
`;

const StatusIcon = styled.span`
  font-size: 1.1rem;
  flex-shrink: 0;
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


const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CardSection = styled.div`
  background: var(--color-primary-800);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 20px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    min-height: 450px;
  }
`;

const CardVideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 auto 16px auto;

  /* 타로 카드 비율: 대략 7:12 */
  width: 140px;

  .card-video-wrapper {
    width: 140px;
    height: 240px;
    border-radius: 8px;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    width: 120px;

    .card-video-wrapper {
      width: 120px;
      height: 200px;
    }
  }
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const CardName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-200);
  margin: 0;
`;

const OrientationBadge = styled.div<{ isReversed: boolean }>`
  background: ${props => props.isReversed ? 'var(--color-warning-400)' : 'var(--color-success-400)'};
  color: var(--color-primary-900);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid ${props => props.isReversed ? 'var(--color-warning-600)' : 'var(--color-success-600)'};
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0 0 16px 0;
  text-align: center;
`;

const CardContent = styled.div`
  color: var(--color-primary-200);
  line-height: 1.6;
  font-size: 0.95rem;
`;

const SummaryContainer = styled.div`
  background: var(--color-primary-900);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  background: var(--color-primary-800);
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid var(--color-accent-400);
`;

const ScoreNumber = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent-300);
`;

const ScoreLabel = styled.span`
  font-size: 1rem;
  color: var(--color-primary-300);
`;

const SummaryText = styled.div`
  color: var(--color-primary-200);
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
`;

const ImageContainer = styled.div`
  background: var(--color-primary-800);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: center;
`;

const ImageTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0 0 16px 0;
`;

const ResultImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
`;

export default ResultPage;