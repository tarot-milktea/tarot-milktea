import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import { useDataStore } from '../store/dataStore';
import ThemeToggle from './etc/ThemeToggle';
import Onboarding1Page from '../pages/Onboarding1Page';
import Onboarding2Page from '../pages/Onboarding2Page';
import Onboarding3Page from '../pages/Onboarding3Page';
import Onboarding4Page from '../pages/Onboarding4Page';
import Onboarding5Page from '../pages/Onboarding5Page';
import CardDrawPage from '../pages/CardDrawPage';
import LoadingPage from '../pages/LoadingPage';

type PageType = 'onboarding1' | 'onboarding2' | 'onboarding3' | 'onboarding4' | 'onboarding5' | 'cardDraw' | 'loading';

function OnboardingFlow() {
  const navigate = useNavigate();
  const { getColor } = useColors();
  const { currentStep, isSessionConfirmed, restoreFromStorage } = useSessionStore();
  const { initializeData } = useDataStore();
  const [currentPage, setCurrentPage] = useState<PageType>('onboarding1');

  // 컴포넌트 마운트 시 세션 복구 및 데이터 초기화
  useEffect(() => {
    // 세션 데이터 복구
    restoreFromStorage();

    // API 데이터 초기화
    initializeData();
  }, [restoreFromStorage, initializeData]);

  // currentStep에 따라 페이지 동기화
  useEffect(() => {
    const stepToPage: Record<number, PageType> = {
      1: 'onboarding1',
      2: 'onboarding2',
      3: 'onboarding3',
      4: 'onboarding4',
      5: 'onboarding5',
      6: 'cardDraw',
      7: 'loading'
    };

    const targetPage = stepToPage[currentStep];
    if (targetPage && targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [currentStep, currentPage]);

  // 결과 페이지로 이동하는 함수
  const goToResult = () => {
    // 카드 스토어에서 선택된 카드들 가져오기
    const selectedCards = JSON.parse(localStorage.getItem('selectedCards') || '[]');
    
    // 결과 데이터 구조 생성
    const tarotResult = {
      cards: selectedCards.map((card: any, index: number) => ({
        id: card.id,
        position: ['past', 'present', 'future'][index] as 'past' | 'present' | 'future',
        orientation: card.orientation || 'upright'
      }))
    };
    
    // 고유 ID 생성
    const resultId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // localStorage에 결과 저장
    localStorage.setItem(`tarot_${resultId}`, JSON.stringify(tarotResult));
    
    // 결과 페이지로 라우팅
    navigate(`/result/${resultId}`);
  };

  const handleStepChange = (step: number) => {
    useSessionStore.getState().setCurrentStep(step);
  };

  const pages: Record<PageType, { title: string; component: JSX.Element }> = {
    onboarding1: {
      title: '온보딩1',
      component: <Onboarding1Page onNext={() => handleStepChange(2)} />
    },
    onboarding2: {
      title: '온보딩2',
      component: <Onboarding2Page
        onNext={() => handleStepChange(3)}
        onPrev={() => handleStepChange(1)}
      />
    },
    onboarding3: {
      title: '온보딩3',
      component: <Onboarding3Page
        onNext={() => handleStepChange(4)}
        onPrev={() => handleStepChange(2)}
      />
    },
    onboarding4: {
      title: '온보딩4',
      component: <Onboarding4Page
        onNext={() => handleStepChange(5)}
        onPrev={() => handleStepChange(3)}
      />
    },
    onboarding5: {
      title: '온보딩5',
      component: <Onboarding5Page
        onNext={() => handleStepChange(6)}
        onPrev={() => handleStepChange(4)}
      />
    },
    cardDraw: {
      title: '카드뽑기',
      component: <CardDrawPage
        onNext={() => handleStepChange(7)}
        onPrev={isSessionConfirmed ? undefined : () => handleStepChange(5)}
      />
    },
    loading: {
      title: '로딩',
      component: <LoadingPage onComplete={goToResult} />
    }
  };

  return (
    <Container>
      {/* 테마 토글 버튼 */}
      <ThemeToggle position="fixed" />

      {/* 현재 페이지 */}
      {pages[currentPage].component}
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  position: relative;
`;

export default OnboardingFlow;