import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useDataStore } from '../store/dataStore';
import { useSessionStore, type Category } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
import SelectableButton from '../components/common/Button/SelectableButton';
// import ThemeToggle from '../components/etc/ThemeToggle';
import { useOnboardingTracking } from '../hooks/useAnalytics';
import { SELECTION_TYPES } from '../utils/analyticsEvents';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';
import { useTTS } from '../hooks/useTTS';

function Onboarding3Page() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { categories, isLoading, error, initializeData } = useDataStore();
  const { selectedCategory, setSelectedCategory, selectedReader, restoreFromStorage } = useSessionStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();

  // Analytics 훅
  const { trackComplete, trackSelection } = useOnboardingTracking(3, 'category_selection');

  // TTS 훅
  const { requestTTSStream, stopAudio, isPlaying, isLoading: ttsLoading } = useTTS({
    autoPlay: true,
    onComplete: () => console.log('TTS playback completed'),
    onError: (error) => console.error('TTS error:', error)
  });

  useEffect(() => {
    restoreFromStorage();
    initializeData();
    setCurrentPage('onboarding-3');
  }, [restoreFromStorage, initializeData, setCurrentPage]);

  // 타입별 TTS 설정 함수
  const getTTSSettings = (category: Category) => {
    const readerType = selectedReader?.type || 'F';
    const baseText = `${category.name}에 대해 살펴보겠습니다.`;

    switch (readerType) {
      case 'F':
        return {
          voice: 'nova' as const,
          instruction: '친근하고 따뜻한 여성의 목소리로, 마치 가까운 언니나 친구가 조언해주는 것처럼 부드럽고 다정하게 말해주세요.',
          text: `${baseText} 마음속 깊은 감정들을 카드를 통해 들여다보아요.`
        };
      case 'T':
        return {
          voice: 'onyx' as const,
          instruction: '차분하고 신중한 남성의 목소리로, 깊이 있고 진중한 톤으로 신뢰감 있게 말해주세요.',
          text: `${baseText} 신중하게 현재 상황을 분석해보겠습니다.`
        };
      case 'FT':
        return {
          voice: 'fable' as const,
          instruction: '신비롭고 매력적인 목소리로, 마치 고대의 현자가 운명을 읽어주는 것처럼 신비로우면서도 따뜻하게 말해주세요.',
          text: `${baseText} 우주의 신비로운 에너지가 당신에게 전하는 메시지를 들어보세요.`
        };
      default:
        return {
          voice: 'nova' as const,
          instruction: '친근하고 자연스러운 목소리로 말해주세요.',
          text: baseText
        };
    }
  };

  const handleCategorySelect = async (category: Category) => {
    // TTS 중지
    stopAudio();

    // 이미 선택된 카테고리를 다시 클릭하면 선택 해제 (토글)
    if (selectedCategory?.code === category.code) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      // Analytics 추적
      trackSelection(SELECTION_TYPES.CATEGORY, category.code);

      // TTS 재생
      try {
        const ttsSettings = getTTSSettings(category);
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
    if (selectedCategory) {
      // TTS 중지
      stopAudio();

      // Analytics 추적
      trackComplete({
        selected_category: selectedCategory.code,
        category_name: selectedCategory.name
      });

      navigate('/onboarding/4');
    }
  };

  const handlePrev = () => {
    // TTS 중지
    stopAudio();

    navigate('/onboarding/2');
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
        어떤 주제로 타로를 보시겠어요?
      </Title>

      <Description
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        관심 있는 분야를 선택해주세요
      </Description>

      {/* 로딩 상태 */}
      {isLoading && (
        <LoadingText style={{ color: getColor('primary', '300') }}>
          카테고리를 불러오는 중...
        </LoadingText>
      )}

      {/* 에러 상태 */}
      {error && (
        <ErrorText style={{ color: getColor('error', '400') }}>
          카테고리를 불러오는데 실패했습니다: {error}
        </ErrorText>
      )}

      {/* 카테고리 목록 */}
      {!isLoading && !error && (
        <CategoryGrid>
          {categories.map((category) => (
            <SelectableButton
              key={category.code}
              onClick={() => handleCategorySelect(category)}
              isSelected={selectedCategory?.code === category.code}
            >
              {/* TTS 로딩 또는 재생 중일 때 표시할 인디케이터 */}
              {(ttsLoading || isPlaying) && selectedCategory?.code === category.code && (
                <TTSIndicator>
                  🔊
                </TTSIndicator>
              )}
              <CategoryTitle
                style={{
                  ...globalStyles.subheading,
                  color: getColor('accent', '300')
                }}
              >
                {category.name}
              </CategoryTitle>
              <CategoryDescription
                style={{
                  ...globalStyles.body,
                  color: getColor('primary', '400')
                }}
              >
                {category.description}
              </CategoryDescription>
            </SelectableButton>
          ))}
        </CategoryGrid>
      )}

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
          disabled={!selectedCategory}
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
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 15px;
`;

const CategoryDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const LoadingText = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

const ErrorText = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

const TTSIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 237, 77, 0.9);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
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

export default Onboarding3Page;