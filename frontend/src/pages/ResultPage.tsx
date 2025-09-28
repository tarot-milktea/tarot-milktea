import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResultData } from '../hooks/useResultData';
import { useResultActions } from '../hooks/useResultActions';
import { resultUtilService } from '../services/resultService';
import Button from '../components/common/Button/Button';
// import ThemeToggle from '../components/etc/ThemeToggle';
import LoadingPage from './LoadingPage';
import InnerHeader from '../components/result/InnerHeader';
import StepContainer from '../components/result/StepContainer';
import StepIndicator from '../components/result/StepIndicator';
import NavigationControls from '../components/result/NavigationControls';
import CardContent from '../components/result/CardContent';
import SummaryContent from '../components/result/SummaryContent';
import LuckyContent from '../components/result/LuckyContent';
import ResultActions from '../components/result/ResultActions';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import { useTTS } from '../hooks/useTTS';
import { getVoiceByReaderType } from '../utils/voiceMapping';
import {
  Container,
  ErrorContainer,
  ErrorText
} from '../components/result/ResultPage.styles';

// 단계 정의
type ResultStep = 'past' | 'present' | 'future' | 'summary' | 'lucky';
const STEPS: ResultStep[] = ['past', 'present', 'future', 'summary', 'lucky'];

interface StepData {
  title: string;
  icon: string;
  index: number;
}

function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();

  // 단계별 상태 관리
  const [currentStep, setCurrentStep] = useState<ResultStep>('past');
  const [hasInitialTTSPlayed, setHasInitialTTSPlayed] = useState(false);

  // 단계별 데이터
  const getStepData = useCallback((step: ResultStep): StepData => {
    const stepMap = {
      past: { title: '과거', icon: '🕰️', index: 0 },
      present: { title: '현재', icon: '⭐', index: 1 },
      future: { title: '미래', icon: '🔮', index: 2 },
      summary: { title: '총평', icon: '📋', index: 3 },
      lucky: { title: '행운카드', icon: '🍀', index: 4 }
    };
    return stepMap[step];
  }, []);

  // TTS 통합
  const { requestTTSStream, isPlaying: isTTSPlaying, stopAudio } = useTTS({
    autoPlay: true,
    onComplete: () => {
      // 자동넘어가기 기능 제거됨
      // TTS 완료 후 사용자가 수동으로 다음 버튼을 눌러야 함
    }
  });

  // 단계 전환 함수들
  const goToNextStep = useCallback(() => {
    const currentIndex = getStepData(currentStep).index;
    if (currentIndex < STEPS.length - 1) {
      // 기존 TTS 중단
      stopAudio();
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  }, [currentStep, getStepData, stopAudio]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = getStepData(currentStep).index;
    if (currentIndex > 0) {
      // 기존 TTS 중단
      stopAudio();
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  }, [currentStep, getStepData, stopAudio]);

  // TTS 스킵 (TTS만 중단, 다음으로 넘어가지 않음)
  const skipTTS = useCallback(() => {
    stopAudio();
  }, [stopAudio]);

  // 커스텀 훅들
  const {
    cardInterpretations,
    summary,
    fortuneScore,
    luckyCard,
    predefinedCards,
    nickname,
    questionText,
    readerType,
    isLoading,
    hasAnyData
  } = useResultData(resultId);

  // 진행률 상태 업데이트
  useEffect(() => {
    setCurrentPage('result');
  }, [setCurrentPage]);

  // 단계별 TTS 재생
  useEffect(() => {
    if (!hasAnyData) return;

    const playStepTTS = async () => {
      let textToSpeak = '';

      switch (currentStep) {
        case 'past':
          if (cardInterpretations.past?.interpretation) {
            textToSpeak = `과거 카드 해석입니다. ${cardInterpretations.past.interpretation}`;
          }
          break;
        case 'present':
          if (cardInterpretations.present?.interpretation) {
            textToSpeak = `현재 카드 해석입니다. ${cardInterpretations.present.interpretation}`;
          }
          break;
        case 'future':
          if (cardInterpretations.future?.interpretation) {
            textToSpeak = `미래 카드 해석입니다. ${cardInterpretations.future.interpretation}`;
          }
          break;
        case 'summary':
          if (summary) {
            textToSpeak = `종합 해석입니다. ${summary}`;
          }
          break;
        case 'lucky':
          if (luckyCard?.message) {
            textToSpeak = `행운 카드 메시지입니다. ${luckyCard.message}`;
          }
          break;
      }

      if (textToSpeak && !hasInitialTTSPlayed) {
        // readerType에 따라 화자 결정
        const voice = getVoiceByReaderType(readerType ?? undefined);
        await requestTTSStream(textToSpeak, voice);
        setHasInitialTTSPlayed(true);
      }
    };

    // 단계 변경 시 TTS 재생
    if (!hasInitialTTSPlayed) {
      playStepTTS();
    }
  }, [currentStep, cardInterpretations, summary, luckyCard, hasAnyData, hasInitialTTSPlayed, requestTTSStream, readerType]);

  // 단계 변경 시 TTS 상태 리셋
  useEffect(() => {
    setHasInitialTTSPlayed(false);
  }, [currentStep]);

  const { handleShare, handleRestart, handleDownloadImage } = useResultActions(resultId);

  // 현재 단계 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'past':
        return (
          <CardContent
            title="과거"
            icon="🕰️"
            card={predefinedCards?.[0]}
            interpretation={cardInterpretations.past?.interpretation}
            videoSize="large"
          />
        );
      case 'present':
        return (
          <CardContent
            title="현재"
            icon="⭐"
            card={predefinedCards?.[1]}
            interpretation={cardInterpretations.present?.interpretation}
            videoSize="large"
          />
        );
      case 'future':
        return (
          <CardContent
            title="미래"
            icon="🔮"
            card={predefinedCards?.[2]}
            interpretation={cardInterpretations.future?.interpretation}
            videoSize="large"
          />
        );
      case 'summary':
        return (
          <SummaryContent
            summary={summary || undefined}
            fortuneScore={fortuneScore}
          />
        );
      case 'lucky':
        return (
          <>
            <LuckyContent luckyCard={luckyCard || undefined} />
            <ResultActions
              onRestart={handleRestart}
              onShare={handleShare}
              onDownloadImage={luckyCard?.imageUrl ? () => handleDownloadImage(luckyCard.imageUrl) : undefined}
            />
          </>
        );
      default:
        return null;
    }
  };

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

      {/* 단계별 컨테이너 */}
      <StepContainer>
        <InnerHeader
          nickname={nickname || undefined}
          questionText={questionText || undefined}
        />

        <StepIndicator currentStep={currentStep} />

        {renderCurrentStep()}

        <NavigationControls
          canGoBack={getStepData(currentStep).index > 0}
          canGoNext={getStepData(currentStep).index < STEPS.length - 1}
          isLastStep={currentStep === 'lucky'}
          isTTSPlaying={isTTSPlaying}
          onPrevious={goToPreviousStep}
          onNext={goToNextStep}
          onSkipTTS={skipTTS}
        />
      </StepContainer>
    </Container>
  );
}

export default ResultPage;