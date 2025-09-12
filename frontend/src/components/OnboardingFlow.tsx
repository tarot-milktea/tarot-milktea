import { useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../hooks/useColors';
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
  const { getColor, theme, toggleTheme } = useColors();
  const [currentPage, setCurrentPage] = useState<PageType>('onboarding1');

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

  const pages: Record<PageType, { title: string; component: JSX.Element }> = {
    onboarding1: { title: '온보딩1', component: <Onboarding1Page onNext={() => setCurrentPage('onboarding2')} /> },
    onboarding2: { title: '온보딩2', component: <Onboarding2Page onNext={() => setCurrentPage('onboarding3')} onPrev={() => setCurrentPage('onboarding1')} /> },
    onboarding3: { title: '온보딩3', component: <Onboarding3Page onNext={() => setCurrentPage('onboarding4')} onPrev={() => setCurrentPage('onboarding2')} /> },
    onboarding4: { title: '온보딩4', component: <Onboarding4Page onNext={() => setCurrentPage('onboarding5')} onPrev={() => setCurrentPage('onboarding3')} /> },
    onboarding5: { title: '온보딩5', component: <Onboarding5Page onNext={() => setCurrentPage('cardDraw')} onPrev={() => setCurrentPage('onboarding4')} /> },
    cardDraw: { title: '카드뽑기', component: <CardDrawPage onNext={() => setCurrentPage('loading')} onPrev={() => setCurrentPage('onboarding5')} /> },
    loading: { title: '로딩', component: <LoadingPage onComplete={goToResult} /> }
  };

  return (
    <Container>
      {/* 테마 토글 버튼 */}
      <ThemeToggle
        onClick={toggleTheme}
        style={{
          border: `2px solid ${getColor('accent', '400')}`,
          background: theme === 'dark' ? getColor('primary', '900') : getColor('primary', '100'),
          color: getColor('accent', '400')
        }}
      >
        {theme === 'dark' ? '☀️ 라이트' : '🌙 다크'}
      </ThemeToggle>

      {/* 현재 페이지 */}
      {pages[currentPage].component}
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  position: relative;
`;

const ThemeToggle = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

export default OnboardingFlow;