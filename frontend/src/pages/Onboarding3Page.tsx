import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useSessionStore, type Topic } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
import SelectableButton from '../components/common/Button/SelectableButton';
// import ThemeToggle from '../components/etc/ThemeToggle';
import { useOnboardingTracking } from '../hooks/useAnalytics';
import { SELECTION_TYPES } from '../utils/analyticsEvents';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import { useProgressStore } from '../store/progressStore';

function Onboarding3Page() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { selectedCategory, selectedTopic, setSelectedTopic } = useSessionStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();

  // Analytics 훅
  const { trackComplete, trackSelection } = useOnboardingTracking(3, 'topic_selection');

  useEffect(() => {
    setCurrentPage('onboarding-3');
  }, [setCurrentPage]);

  const handleTopicSelect = (topic: Topic) => {
    // 이미 선택된 주제를 다시 클릭하면 선택 해제 (토글)
    if (selectedTopic?.code === topic.code) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
      // Analytics 추적
      trackSelection(SELECTION_TYPES.TOPIC, topic.code);
    }
  };

  const handleNext = () => {
    if (selectedTopic) {
      // Analytics 추적
      trackComplete({
        selected_topic: selectedTopic.code,
        topic_name: selectedTopic.name
      });

      navigate('/onboarding/4');
    }
  };

  const handlePrev = () => {
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
  margin-bottom: 20px;
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

export default Onboarding3Page;