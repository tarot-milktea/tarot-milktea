import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import Button from '../components/Button';
import ButtonGroup from '../components/ButtonGroup';

interface Onboarding3PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding3Page({ onNext, onPrev }: Onboarding3PageProps) {
  const { styles: globalStyles, getColor } = useColors();

  const selectedTopic = '연애';
  const subTopics = ['현재 인연', '과거 인연', '미래 인연', '짝사랑', '이별', '복합'];

  return (
    <Container style={globalStyles.container}>
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
          선택된 주제: <strong>{selectedTopic}</strong>
        </SelectedTopicText>
      </SelectedTopic>

      <SubtopicGrid>
        {subTopics.map((subTopic, index) => (
          <SubtopicButton
            key={index}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`,
              color: getColor('primary', '200')
            }}
          >
            {subTopic}
          </SubtopicButton>
        ))}
      </SubtopicGrid>

      <ButtonGroup gap="large">
        <Button 
          variant="secondary"
          size="large"
          onClick={onPrev}
        >
          이전
        </Button>
        <Button 
          variant="primary"
          size="large"
          onClick={onNext}
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

const SubtopicButton = styled.button`
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  background: none;
  border-radius: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

export default Onboarding3Page;