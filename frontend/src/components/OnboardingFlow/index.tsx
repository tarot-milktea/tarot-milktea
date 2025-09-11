import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../../hooks/useColors';
import Onboarding1Page from '../../pages/Onboarding1Page';
import Onboarding2Page from '../../pages/Onboarding2Page';
import Onboarding3Page from '../../pages/Onboarding3Page';
import Onboarding4Page from '../../pages/Onboarding4Page';
import Onboarding5Page from '../../pages/Onboarding5Page';
import CardDrawPage from '../../pages/CardDrawPage';
import LoadingPage from '../../pages/LoadingPage';
import styles from './OnboardingFlow.module.css';

type PageType = 'onboarding1' | 'onboarding2' | 'onboarding3' | 'onboarding4' | 'onboarding5' | 'cardDraw' | 'loading';

function OnboardingFlow() {
  const navigate = useNavigate();
  const { getColor, theme, toggleTheme } = useColors();
  const [currentPage, setCurrentPage] = useState<PageType>('onboarding1');

  // 결과 페이지로 이동하는 함수
  const goToResult = (tarotResult: unknown) => {
    // 고유 ID 생성
    const resultId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // localStorage에 결과 저장
    localStorage.setItem(`tarot_${resultId}`, JSON.stringify(tarotResult));
    
    // 결과 페이지로 라우팅
    navigate(`/result/${resultId}`);
  };

  const pages: Record<PageType, { title: string; component: JSX.Element }> = {
    onboarding1: { title: '온보딩1', component: <Onboarding1Page /> },
    onboarding2: { title: '온보딩2', component: <Onboarding2Page /> },
    onboarding3: { title: '온보딩3', component: <Onboarding3Page /> },
    onboarding4: { title: '온보딩4', component: <Onboarding4Page /> },
    onboarding5: { title: '온보딩5', component: <Onboarding5Page /> },
    cardDraw: { title: '카드뽑기', component: <CardDrawPage /> },
    loading: { title: '로딩', component: <LoadingPage onComplete={() => goToResult({ cards: ['card1', 'card2', 'card3'] })} /> }
  };

  return (
    <div className={styles.container}>
      {/* 테마 토글 버튼 */}
      <button
        onClick={toggleTheme}
        className={styles.themeToggle}
        style={{
          border: `2px solid ${getColor('accent', '400')}`,
          background: theme === 'dark' ? getColor('primary', '900') : getColor('primary', '100'),
          color: getColor('accent', '400')
        }}
      >
        {theme === 'dark' ? '☀️ 라이트' : '🌙 다크'}
      </button>

      {/* Page Navigation (개발용) */}
      <div className={styles.pageNavigation}>
        {Object.entries(pages).map(([pageKey, pageData]) => (
          <button
            key={pageKey}
            onClick={() => setCurrentPage(pageKey as PageType)}
            className={`${styles.navButton} ${currentPage === pageKey ? styles.active : ''}`}
            style={{
              border: `1px solid ${getColor('primary', '700')}`,
              background: currentPage === pageKey ? getColor('accent', '400') : getColor('primary', '800'),
              color: currentPage === pageKey ? getColor('primary', '900') : getColor('primary', '300')
            }}
          >
            {pageData.title}
          </button>
        ))}
        
        {/* 결과 페이지 테스트 버튼 */}
        <button
          onClick={() => goToResult({ cards: ['test1', 'test2', 'test3'] })}
          className={styles.testButton}
          style={{
            border: `1px solid ${getColor('gold', '400')}`,
            background: getColor('gold', '400'),
            color: getColor('primary', '900')
          }}
        >
          결과 테스트
        </button>
      </div>

      {/* 현재 페이지 */}
      {pages[currentPage].component}
    </div>
  );
}

export default OnboardingFlow;