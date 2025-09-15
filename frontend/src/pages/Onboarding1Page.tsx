import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input';

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
        <InputWrapper>
          <Input 
            type="text" 
            placeholder="닉네임 입력 (자동 생성됨)"
            size="large"
          />
        </InputWrapper>
        
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

const InputWrapper = styled.div`
  margin-bottom: 20px;
`;

export default Onboarding1Page;