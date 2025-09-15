import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';

interface Onboarding5PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding5Page({ onNext, onPrev }: Onboarding5PageProps) {
  const { styles: globalStyles, getColor } = useColors();

  const characters = [
    {
      type: 'T',
      title: '냉정한 분석가',
      description: '완전 냉정하고 현실적인 어투로 객관적인 분석을 제공합니다'
    },
    {
      type: 'F', 
      title: '감성적 상담사',
      description: '완전 감성적이고 공감을 잘해주는 따뜻한 어투로 위로와 격려를 전합니다'
    },
    {
      type: 'TF',
      title: '균형잡힌 조언자', 
      description: '이성과 감성의 균형을 맞춘 조화로운 해석을 제공합니다'
    }
  ];

  return (
    <Container style={globalStyles.container}>
      <Title 
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        타로를 봐줄 캐릭터를 선택하세요
      </Title>
      
      <Description 
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        어떤 스타일의 해석을 받고 싶으신가요?
      </Description>

      <CharacterGrid>
        {characters.map((character, index) => (
          <CharacterCard
            key={index}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`
            }}
          >
            <CharacterAvatar 
              style={{
                background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`
              }}
            >
              {character.type}
            </CharacterAvatar>
            
            <CharacterInfo>
              <CharacterTitle 
                style={{
                  ...globalStyles.subheading,
                  color: getColor('accent', '300')
                }}
              >
                {character.title}
              </CharacterTitle>
              
              <CharacterDescription 
                style={{
                  ...globalStyles.body,
                  color: getColor('primary', '400')
                }}
              >
                {character.description}
              </CharacterDescription>
            </CharacterInfo>
          </CharacterCard>
        ))}
      </CharacterGrid>

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

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  max-width: 1000px;
  width: 100%;
  margin-bottom: 40px;
`;

const CharacterCard = styled.div`
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 12px;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const CharacterAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary-900);
  margin-bottom: 20px;
`;

const CharacterInfo = styled.div`
  flex: 1;
`;

const CharacterTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 15px;
`;

const CharacterDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

export default Onboarding5Page;