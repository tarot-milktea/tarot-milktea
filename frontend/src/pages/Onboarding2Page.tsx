import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import Button from '../components/Button';
import ButtonGroup from '../components/ButtonGroup';

interface Onboarding2PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding2Page({ onNext, onPrev }: Onboarding2PageProps) {
  const { styles: globalStyles, getColor } = useColors();

  const topics = ['취업', '연애', '금전', '건강', '인간관계', '학업'];

  return (
    <Container style={globalStyles.container}>
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

      <TopicGrid>
        {topics.map((topic, index) => (
          <TopicButton
            key={index}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`,
              color: getColor('primary', '200')
            }}
          >
            {topic}
          </TopicButton>
        ))}
      </TopicGrid>

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

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
`;

const TopicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 40px;
`;

const TopicButton = styled.button`
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  background: none;
  border-radius: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

export default Onboarding2Page;