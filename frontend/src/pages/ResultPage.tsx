import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResultData } from '../hooks/useResultData';
import { useResultActions } from '../hooks/useResultActions';
import { resultUtilService } from '../services/resultService';
import Button from '../components/common/Button/Button';
// import ThemeToggle from '../components/etc/ThemeToggle';
import LoadingPage from './LoadingPage';
import ResultHeader from '../components/result/ResultHeader';
import CardInterpretationSection from '../components/result/CardInterpretationSection';
import SummarySection from '../components/result/SummarySection';
import ResultImageSection from '../components/result/ResultImageSection';
import ResultActions from '../components/result/ResultActions';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import {
  Container,
  Content,
  CardsGrid,
  ErrorContainer,
  ErrorText
} from '../components/result/ResultPage.styles';

function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();

  // 진행률 상태 업데이트
  useEffect(() => {
    setCurrentPage('result');
  }, [setCurrentPage]);

  // 커스텀 훅들
  const {
    cardInterpretations,
    summary,
    fortuneScore,
    adviceImageUrl,
    predefinedCards,
    isLoading,
    hasError,
    error,
    hasAnyData
  } = useResultData(resultId);

  const { handleShare, handleRestart, handleDownloadImage } = useResultActions(resultId);

  // resultId 유효성 검사
  if (!resultUtilService.isValidResultId(resultId)) {
    return (
      <ErrorContainer>
        <ErrorText>유효하지 않은 결과 ID입니다.</ErrorText>
        <Button
          variant="primary"
          size="large"
          onClick={() => navigate('/')}
        >
          새로운 타로 보기
        </Button>
      </ErrorContainer>
    );
  }

  // 로딩 상태
  if (isLoading && !hasAnyData) {
    return <LoadingPage />;
  }

  return (
    <Container>
      <ProgressBar currentStep={getCurrentStep()} totalSteps={getTotalSteps()} />
      {/* 테마 토글 버튼 */}
      {/* <ThemeToggle position="absolute" /> */}

      <Content>
        {/* 헤더 */}
        <ResultHeader error={hasError ? error : undefined} />

        {/* 카드 해석 - 가로 배치 */}
        <CardsGrid>
          <CardInterpretationSection
            title="과거"
            icon="🕰️"
            card={predefinedCards?.[0]}
            interpretation={cardInterpretations.past?.interpretation}
            videoSize="large"
          />

          <CardInterpretationSection
            title="현재"
            icon="⭐"
            card={predefinedCards?.[1]}
            interpretation={cardInterpretations.present?.interpretation}
            videoSize="small"
          />

          <CardInterpretationSection
            title="미래"
            icon="🔮"
            card={predefinedCards?.[2]}
            interpretation={cardInterpretations.future?.interpretation}
            videoSize="small"
          />
        </CardsGrid>

        {/* 종합 해석 및 점수 */}
        <SummarySection
          summary={summary || undefined}
          fortuneScore={fortuneScore}
        />

        {/* 결과 이미지 */}
        <ResultImageSection imageUrl={adviceImageUrl || undefined} />

        {/* 액션 버튼들 */}
        <ResultActions
          onRestart={handleRestart}
          onShare={handleShare}
          onDownloadImage={adviceImageUrl ? () => handleDownloadImage(adviceImageUrl) : undefined}
        />
      </Content>
    </Container>
  );
}

export default ResultPage;