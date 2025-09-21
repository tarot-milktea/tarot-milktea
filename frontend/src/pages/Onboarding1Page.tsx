import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import { useDataStore } from '../store/dataStore';
import Button from '../components/common/Button/Button';
import NicknameInput from '../components/etc/NicknameInput';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/etc/ThemeToggle';
import { generateRandomNickname } from '../utils/nicknameGenerator';
import { showToast } from '../components/common/Toast';
import { trackOnboardingEnter, trackOnboardingComplete, trackUserSelection } from '../utils/analytics';

function Onboarding1Page() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { nickname, setNickname, restoreFromStorage } = useSessionStore();
  const { initializeData } = useDataStore();
  const [localNickname, setLocalNickname] = useState(nickname || '');
  const [isValid, setIsValid] = useState(false);

  // 컴포넌트 마운트 시 세션 복구 및 데이터 초기화
  useEffect(() => {
    restoreFromStorage();
    initializeData();

    // GA: 온보딩 1단계 진입 추적
    trackOnboardingEnter(1, 'nickname_input');
  }, [restoreFromStorage, initializeData]);

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

      // GA: 온보딩 1단계 완료 추적 (랜덤 닉네임)
      trackOnboardingComplete(1, 'nickname_input', {
        nickname_type: 'random',
        nickname_length: randomNickname.length
      });
      trackUserSelection('nickname', 'random_generated', 1);

      navigate('/onboarding/2');
      return;
    }

    // 유효한 닉네임인 경우 진행
    if (isValid) {
      setNickname(trimmedNickname);
      showToast.success(`"${trimmedNickname}"님, 환영합니다!`);

      // GA: 온보딩 1단계 완료 추적 (사용자 입력)
      trackOnboardingComplete(1, 'nickname_input', {
        nickname_type: 'user_input',
        nickname_length: trimmedNickname.length
      });
      trackUserSelection('nickname', 'user_input', 1);

      navigate('/onboarding/2');
    } else {
      showToast.error('올바른 닉네임을 입력해주세요');
    }
  };

  return (
    <Container style={globalStyles.container}>
      {/* 테마 토글 버튼 */}
      <ThemeToggle position="fixed" />

      <HeaderSection>
        <Logo />
        <WelcomeText
          style={{
            ...globalStyles.heading,
            color: getColor('primary', '200')
          }}
        >
          신비로운 타로의 세계에 오신 것을 환영합니다
        </WelcomeText>
      </HeaderSection>

      <ContentSection>
        <Description
          style={{
            ...globalStyles.body,
            color: getColor('primary', '300')
          }}
        >
          운명의 여행을 시작하기 위한 당신의 이름을 알려주세요
          <SubDescription style={{ color: getColor('primary', '400') }}>
            비워두시면 우주가 선택한 신비로운 이름을 드려요 ✨
          </SubDescription>
        </Description>

        <InputCard style={globalStyles.card}>
          <InputWrapper>
            <NicknameInput
              value={localNickname}
              onChange={setLocalNickname}
              onValidationChange={handleValidationChange}
              placeholder="닉네임(선택사항)"
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
            시작하기
          </Button>
        </InputCard>
      </ContentSection>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 40px 20px;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 5px;
`;

const WelcomeText = styled.h1`
  font-size: 2rem;
  margin-top: 20px;
  font-weight: 600;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
`;

const Description = styled.div`
  font-size: 1.1rem;
  margin-bottom: 30px;
  font-weight: 500;
  line-height: 1.6;
`;

const SubDescription = styled.div`
  font-size: 0.95rem;
  margin-top: 8px;
  opacity: 0.8;
  font-weight: 400;
`;

const InputCard = styled.div`
  padding: 30px;
  width: 100%;
`;

const InputWrapper = styled.div`
  margin-bottom: 20px;
`;

export default Onboarding1Page;