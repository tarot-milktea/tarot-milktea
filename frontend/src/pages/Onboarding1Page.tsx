import { useState } from 'react';
import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import NicknameInput from '../components/etc/NicknameInput';
import { generateRandomNickname } from '../utils/nicknameGenerator';
import { showToast } from '../components/common/Toast';

interface Onboarding1PageProps {
  onNext: () => void;
}

function Onboarding1Page({ onNext }: Onboarding1PageProps) {
  const { styles: globalStyles, getColor } = useColors();
  const { nickname, setNickname } = useSessionStore();
  const [localNickname, setLocalNickname] = useState(nickname || '');
  const [isValid, setIsValid] = useState(false);

  const handleValidationChange = (valid: boolean) => {
    setIsValid(valid);
  };

  const handleNext = () => {
    const trimmedNickname = localNickname.trim();

    // 빈 입력인 경우 랜덤 닉네임 생성
    if (!trimmedNickname) {
      const randomNickname = generateRandomNickname();
      setNickname(randomNickname);
      showToast.success(`"${randomNickname}"으로 모험을 시작합니다!`);
      onNext();
      return;
    }

    // 유효한 닉네임인 경우 진행
    if (isValid) {
      setNickname(trimmedNickname);
      showToast.success(`"${trimmedNickname}"님, 환영합니다!`);
      onNext();
    } else {
      showToast.error('올바른 닉네임을 입력해주세요');
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
        <SubDescription style={{ color: getColor('primary', '400') }}>
          빈 칸으로 두면 신비로운 닉네임을 자동으로 생성해드려요 ✨
        </SubDescription>
      </Description>

      <InputCard style={globalStyles.card}>
        <InputWrapper>
          <NicknameInput
            value={localNickname}
            onChange={setLocalNickname}
            onValidationChange={handleValidationChange}
            placeholder="닉네임을 입력하거나 비워두세요"
            inputSize="large"
            autoFocus
            showLiveValidation={true}
          />
        </InputWrapper>

        <Button
          variant="primary"
          size="large"
          onClick={handleNext}
        >
          {localNickname.trim() ? '시작하기' : '랜덤 닉네임으로 시작하기'}
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

const Description = styled.div`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
  line-height: 1.5;
`;

const SubDescription = styled.div`
  font-size: 1rem;
  margin-top: 8px;
  opacity: 0.8;
  font-weight: 400;
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