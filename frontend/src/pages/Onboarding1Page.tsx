import { useState } from 'react';
import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';

interface Onboarding1PageProps {
  onNext: () => void;
}

function Onboarding1Page({ onNext }: Onboarding1PageProps) {
  const { styles: globalStyles, getColor } = useColors();
  const { nickname, setNickname } = useSessionStore();
  const [localNickname, setLocalNickname] = useState(nickname);

  const handleNext = () => {
    if (localNickname.trim()) {
      setNickname(localNickname.trim());
      onNext();
    }
  };

  return (
    <Container style={globalStyles.container}>
      <Title 
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        🔮 타로밀크티에 오신 것을 환영합니다
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
            placeholder="닉네임을 입력해주세요"
            size="large"
            value={localNickname}
            onChange={(e) => setLocalNickname(e.target.value)}
          />
        </InputWrapper>

        <Button
          variant="primary"
          size="large"
          onClick={handleNext}
          disabled={!localNickname.trim()}
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