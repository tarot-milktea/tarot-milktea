import { useState } from 'react';
import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import NicknameInput from '../components/etc/NicknameInput';
import Logo from '../components/common/Logo';
import { generateRandomNickname } from '../utils/nicknameGenerator';
import { showToast } from '../components/common/Toast';

interface TempOnboardingPageProps {
  onNext?: () => void;
}

function TempOnboardingPage({ onNext }: TempOnboardingPageProps) {
  const { styles: globalStyles, getColor } = useColors();
  const { nickname, setNickname } = useSessionStore();
  const [localNickname, setLocalNickname] = useState(nickname || '');
  const [isValid, setIsValid] = useState(false);

  const handleValidationChange = (valid: boolean) => {
    setIsValid(valid);
  };

  const handleNext = () => {
    const trimmedNickname = localNickname.trim();

    if (!trimmedNickname) {
      const randomNickname = generateRandomNickname();
      setNickname(randomNickname);
      showToast.success(`"${randomNickname}"으로 모험을 시작합니다!`);
      if (onNext) onNext();
      return;
    }

    if (isValid) {
      setNickname(trimmedNickname);
      showToast.success(`"${trimmedNickname}"님, 환영합니다!`);
      if (onNext) onNext();
    } else {
      showToast.error('올바른 닉네임을 입력해주세요');
    }
  };

  return (
    <PageContainer style={globalStyles.container}>
      <BackgroundDecor />

      <ContentArea>
        <MainSection>
          <StyledLogo />

          <WelcomeSection>
            <Greeting style={{ color: getColor('primary', '200') }}>
              신비로운 타로의 세계에 오신 것을 환영합니다
            </Greeting>
            <SubGreeting style={{ color: getColor('primary', '400') }}>
              당신의 운명을 읽어드릴게요 🌟
            </SubGreeting>
          </WelcomeSection>
        </MainSection>

        <InteractionSection>
          <InputCard style={globalStyles.card}>
            <InputTitle style={{ color: getColor('primary', '300') }}>
              여행을 시작하기 전, 어떻게 불러드릴까요?
            </InputTitle>

            <NicknameInputWrapper>
              <NicknameInput
                value={localNickname}
                onChange={setLocalNickname}
                onValidationChange={handleValidationChange}
                placeholder="닉네임을 입력하거나 비워두세요"
                inputSize="large"
                autoFocus
                showLiveValidation={true}
              />
            </NicknameInputWrapper>

            <ActionButton
              variant="primary"
              size="large"
              onClick={handleNext}
            >
              {localNickname.trim() ? '🔮 타로 여행 시작하기' : '✨ 신비로운 이름으로 시작하기'}
            </ActionButton>

            <HintText style={{ color: getColor('primary', '500') }}>
              이름을 비워두시면 운명이 정해준 이름을 받아보실 수 있어요
            </HintText>
          </InputCard>
        </InteractionSection>
      </ContentArea>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`;

const BackgroundDecor = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
`;

const ContentArea = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 100vh;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 60px;
`;

const StyledLogo = styled(Logo)`
  transform: translateY(-20px);
`;

const WelcomeSection = styled.div`
  max-width: 500px;
`;

const Greeting = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SubGreeting = styled.p`
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
`;

const InteractionSection = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 40px;
`;

const InputCard = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
`;

const InputTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
`;

const NicknameInputWrapper = styled.div`
  width: 100%;
`;

const ActionButton = styled(Button)`
  margin-top: 8px;
`;

const HintText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
  opacity: 0.7;
  line-height: 1.4;
`;

export default TempOnboardingPage;