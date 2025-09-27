import { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
import SelectableButton from '../components/common/Button/SelectableButton';
// import ThemeToggle from '../components/etc/ThemeToggle';
import { useOnboardingTracking } from '../hooks/useAnalytics';
import { SELECTION_TYPES } from '../utils/analyticsEvents';
import QuestionInput from '../components/etc/QuestionInput/QuestionInput';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import { useTTS } from '../hooks/useTTS';

function Onboarding5Page() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { selectedTopic, selectedQuestion, setSelectedQuestion, createSession, selectedReader } = useSessionStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();
  const [customQuestion, setCustomQuestion] = useState('');

  // Analytics 훅
  const { trackComplete, trackSelection } = useOnboardingTracking(5, 'question_input');

  // TTS 훅
  const { requestTTSStream, stopAudio, isPlaying, isLoading: ttsLoading } = useTTS({
    autoPlay: true,
    onComplete: () => console.log('TTS playback completed'),
    onError: (error) => console.error('TTS error:', error)
  });

  useEffect(() => {
    setCurrentPage('onboarding-5');
  }, [setCurrentPage]);

  const sampleQuestions = selectedTopic?.sampleQuestions || [];

  // 타입별 TTS 설정 함수
  const getTTSSettings = () => {
    const readerType = selectedReader?.type || 'F';

    switch (readerType) {
      case 'F':
        return {
          voice: 'nova' as const,
          instruction: '친근하고 따뜻한 여성의 목소리로, 마치 가까운 언니나 친구가 조언해주는 것처럼 부드럽고 다정하게 말해주세요.',
          text: `좋은 질문이에요! 이제 다음을 눌러주세요.`
        };
      case 'T':
        return {
          voice: 'onyx' as const,
          instruction: '차분하고 신중한 남성의 목소리로, 깊이 있고 진중한 톤으로 신뢰감 있게 말해주세요.',
          text: `명확한 질문입니다. 이제 다음을 눌러주세요.`
        };
      case 'FT':
        return {
          voice: 'fable' as const,
          instruction: '신비롭고 매력적인 목소리로, 마치 고대의 현자가 운명을 읽어주는 것처럼 신비로우면서도 따뜻하게 말해주세요.',
          text: `깊이 있는 질문이군요. 이제 다음을 눌러주세요.`
        };
      default:
        return {
          voice: 'nova' as const,
          instruction: '친근하고 자연스러운 목소리로 말해주세요.',
          text: `좋은 질문이네요. 이제 다음을 눌러주세요.`
        };
    }
  };

  const handleQuestionSelect = async (question: string) => {
    // TTS 중지
    stopAudio();

    // 이미 선택된 질문을 다시 클릭하면 선택 해제 (토글)
    if (selectedQuestion === question && !customQuestion) {
      setSelectedQuestion('');
    } else {
      setSelectedQuestion(question);
      setCustomQuestion('');

      // TTS 재생
      try {
        const ttsSettings = getTTSSettings();
        await requestTTSStream(
          ttsSettings.text,
          ttsSettings.voice,
          ttsSettings.instruction
        );
      } catch (error) {
        console.error('TTS 재생 실패:', error);
      }
    }
  };

  // 커스텀 질문 TTS debounced 함수
  const debouncedTTS = useCallback((text: string) => {
    const timeoutId = setTimeout(async () => {
      if (text.trim().length > 10) { // 10자 이상일 때만 TTS 재생
        try {
          const ttsSettings = getTTSSettings();
          await requestTTSStream(
            ttsSettings.text,
            ttsSettings.voice,
            ttsSettings.instruction
          );
        } catch (error) {
          console.error('TTS 재생 실패:', error);
        }
      }
    }, 1000); // 1초 debounce

    return () => clearTimeout(timeoutId);
  }, [requestTTSStream, selectedReader?.type]);

  const handleCustomQuestionChange = (value: string) => {
    stopAudio(); // 이전 TTS 중지
    setCustomQuestion(value);
    setSelectedQuestion(value);

    // debounced TTS 실행
    debouncedTTS(value);
  };

  const handleNext = async () => {
    if (!selectedQuestion.trim()) return;

    // TTS 중지
    stopAudio();

    try {
      // 질문 입력 완료 후 세션 생성 (미리 정해진 카드들도 함께 가져옴)
      await createSession();

      // Analytics 추적
      trackComplete({
        question_length: selectedQuestion.trim().length,
        question_source: customQuestion ? 'custom' : 'sample'
      });
      trackSelection(SELECTION_TYPES.QUESTION, customQuestion ? 'custom_input' : 'sample_question');

      navigate('/onboarding/card-draw');
    } catch (error) {
      console.error('Failed to create session:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  const handlePrev = () => {
    // TTS 중지
    stopAudio();

    navigate('/onboarding/4');
  };

  return (
    <Container style={globalStyles.container}>
      <ProgressBar currentStep={getCurrentStep()} totalSteps={getTotalSteps()} />
      {/* 테마 토글 버튼 */}
      {/* <ThemeToggle position="fixed" /> */}
      <Title
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        구체적인 질문을 선택해주세요
      </Title>

      <QuestionList>
        {sampleQuestions.map((question, index) => (
          <SelectableButton
            key={index}
            onClick={() => handleQuestionSelect(question)}
            isSelected={selectedQuestion === question && !customQuestion}
            textAlign="left"
          >
            {/* TTS 로딩 또는 재생 중일 때 표시할 인디케이터 */}
            {(ttsLoading || isPlaying) && selectedQuestion === question && !customQuestion && (
              <TTSIndicator>
                🔊
              </TTSIndicator>
            )}
            {question}
          </SelectableButton>
        ))}
      </QuestionList>

      <CustomInput style={{ ...globalStyles.card, position: 'relative' }}>
        {/* 커스텀 질문 TTS 인디케이터 */}
        {(ttsLoading || isPlaying) && customQuestion && (
          <CustomTTSIndicator>
            🔊
          </CustomTTSIndicator>
        )}
        <CustomInputLabel
          style={{
            ...globalStyles.body,
            color: getColor('primary', '300')
          }}
        >
          직접 작성하기
        </CustomInputLabel>
        <QuestionInput
          placeholder="궁금한 질문을 자유롭게 작성해주세요..."
          inputSize="medium"
          value={customQuestion}
          onChange={handleCustomQuestionChange}
          showLiveValidation={true}
        />
      </CustomInput>

      <ButtonGroup gap="large">
        <Button
          variant="secondary"
          size="large"
          onClick={handlePrev}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={handleNext}
          disabled={!selectedQuestion.trim()}
        >
          다음
        </Button>
      </ButtonGroup>
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
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 30px;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  width: 100%;
  margin-bottom: 30px;
`;

const CustomInput = styled.div`
  padding: 30px;
  max-width: 600px;
  width: 100%;
  margin-bottom: 40px;
`;

const CustomInputLabel = styled.p`
  font-size: 1.1rem;
  margin-bottom: 15px;
`;

const TTSIndicator = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 237, 77, 0.9);
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  animation: pulse 1.5s ease-in-out infinite alternate;

  @keyframes pulse {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1.1);
    }
  }
`;

const CustomTTSIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 15px;
  background: rgba(255, 237, 77, 0.9);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite alternate;
  z-index: 1;

  @keyframes pulse {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1.1);
    }
  }
`;

export default Onboarding5Page;