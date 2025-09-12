import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import Button from '../components/Button';

interface Onboarding1PageProps {
  onNext: () => void;
}

function Onboarding1Page({ onNext }: Onboarding1PageProps) {
  const { styles: globalStyles, getColor } = useColors();

  return (
    <Container style={globalStyles.container}>
      <Title 
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        🔮 타로 인사이트에 오신 것을 환영합니다
      </Title>
      
      <Description 
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        닉네임을 입력해주세요
      </Description>

      <InputCard style={globalStyles.card}>
        <NicknameInput 
          type="text" 
          placeholder="닉네임 입력 (자동 생성됨)"
          style={{
            border: `2px solid ${getColor('primary', '700')}`,
            background: getColor('primary', '900'),
            color: getColor('primary', '200')
          }}
        />
        
        <Button 
          variant="primary"
          size="large"
          onClick={onNext}
        >
          시작하기
        </Button>
      </InputCard>
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

const InputCard = styled.div`
  padding: 40px;
  max-width: 400px;
  width: 100%;
`;

const NicknameInput = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  border-radius: 8px;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

export default Onboarding1Page;