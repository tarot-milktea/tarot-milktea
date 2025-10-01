import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useSessionStore, type Topic } from '../store/sessionStore';
import { useDataStore } from '../store/dataStore';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
import SelectableButton from '../components/common/Button/SelectableButton';
// import ThemeToggle from '../components/etc/ThemeToggle';
import { useOnboardingTracking } from '../hooks/useAnalytics';
import { SELECTION_TYPES } from '../utils/analyticsEvents';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import { useTTS } from '../hooks/useTTS';

function Onboarding4Page() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { selectedCategory, selectedTopic, setSelectedTopic, selectedReader, restoreFromStorage } = useSessionStore();
  const { initializeData } = useDataStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();

  // Analytics 훅
  const { trackComplete, trackSelection } = useOnboardingTracking(4, 'topic_selection');

  // TTS 훅
  const { requestTTSStream, stopAudio, isPlaying, isLoading: ttsLoading } = useTTS({
    autoPlay: true,
    onComplete: () => console.log('TTS playback completed'),
    onError: (error) => console.error('TTS error:', error)
  });

  useEffect(() => {
    restoreFromStorage();
    initializeData();
    setCurrentPage('onboarding-4');
  }, [restoreFromStorage, initializeData, setCurrentPage]);

  // 타입별 TTS 설정 함수
  const getTTSSettings = (topic: Topic) => {
    const readerType = selectedReader?.type || 'F';
    const baseText = `${topic.name}에 대해 더 자세히 살펴보겠습니다.`;

    switch (readerType) {
      case 'F':
        return {
          voice: 'nova' as const,
          instruction: '친근하고 따뜻한 여성의 목소리로, 마치 가까운 언니나 친구가 조언해주는 것처럼 부드럽고 다정하게 말해주세요.',
          text: `좋은 선택이에요! ${baseText} 카드들이 따뜻한 답변을 준비하고 있어요.`
        };
      case 'T':
        return {
          voice: 'onyx' as const,
          instruction: '차분하고 신중한 남성의 목소리로, 깊이 있고 진중한 톤으로 신뢰감 있게 말해주세요.',
          text: `적절한 선택입니다. ${baseText} 이 분야에 대해 깊이 있게 분석해보겠습니다.`
        };
      case 'FT':
        return {
          voice: 'fable' as const,
          instruction: '신비롭고 매력적인 목소리로, 마치 고대의 현자가 운명을 읽어주는 것처럼 신비로우면서도 따뜻하게 말해주세요.',
          text: `흥미로운 주제네요. ${baseText} 카드들이 어떤 신비로운 이야기를 들려줄지 기대됩니다.`
        };
      default:
        return {
          voice: 'nova' as const,
          instruction: '친근하고 자연스러운 목소리로 말해주세요.',
          text: baseText
        };
    }
  };

  const handleTopicSelect = async (topic: Topic) => {
    // TTS 중지
    stopAudio();

    // 이미 선택된 주제를 다시 클릭하면 선택 해제 (토글)
    if (selectedTopic?.code === topic.code) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
      // Analytics 추적
      trackSelection(SELECTION_TYPES.TOPIC, topic.code);

      // TTS 재생
      try {
        const ttsSettings = getTTSSettings(topic);
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

  const handleNext = () => {
    if (selectedTopic) {
      // TTS 중지
      stopAudio();

      // Analytics 추적
      trackComplete({
        selected_topic: selectedTopic.code,
        topic_name: selectedTopic.name
      });

      navigate('/onboarding/5');
    }
  };

  const handlePrev = () => {
    // TTS 중지
    stopAudio();

    navigate('/onboarding/3');
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
        세부 주제를 선택해주세요
      </Title>

      <SelectedTopic
        style={{
          ...globalStyles.card,
          background: `linear-gradient(135deg, ${getColor('accent', '400')}20 0%, ${getColor('accent', '300')}10 100%)`
        }}
      >
        <SelectedTopicText
          style={{
            ...globalStyles.body,
            color: getColor('accent', '300')
          }}
        >
          선택된 주제: <strong>{selectedCategory?.name || '없음'}</strong>
        </SelectedTopicText>
      </SelectedTopic>

      <SubtopicGrid>
        {selectedCategory?.topics.map((topic) => (
          <SelectableButton
            key={topic.code}
            onClick={() => handleTopicSelect(topic)}
            isSelected={selectedTopic?.code === topic.code}
          >
            {/* TTS 로딩 또는 재생 중일 때 표시할 인디케이터 */}
            {(ttsLoading || isPlaying) && selectedTopic?.code === topic.code && (
              <TTSIndicator>
                🔊
              </TTSIndicator>
            )}
            <TopicTitle>{topic.name}</TopicTitle>
            <TopicDescription>{topic.description}</TopicDescription>
          </SelectableButton>
        ))}
      </SubtopicGrid>

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
          disabled={!selectedTopic}
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

const SelectedTopic = styled.div`
  padding: 20px 30px;
  margin-bottom: 30px;
  border-radius: 12px;
`;

const SelectedTopicText = styled.p`
  font-size: 1.2rem;
  margin: 0;
`;

const SubtopicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 40px;
`;

const TopicTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const TopicDescription = styled.p`
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.4;
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

export default Onboarding4Page;