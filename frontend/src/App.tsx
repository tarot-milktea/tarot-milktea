import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Onboarding1Page from './pages/Onboarding1Page';
import Onboarding2Page from './pages/Onboarding2Page';
import Onboarding3Page from './pages/Onboarding3Page';
import Onboarding4Page from './pages/Onboarding4Page';
import Onboarding5Page from './pages/Onboarding5Page';
import CardDrawPage from './pages/CardDrawPage';
import LoadingPage from './pages/LoadingPage';
import LoadingPageDemo from './pages/LoadingPageDemo';
import ResultPage from './pages/ResultPage';
import ErrorPage from './pages/ErrorPage';
import ParticleBackground from './components/common/ParticleBackground/ParticleBackground';
import { initializeGA, trackPageView, debugGA } from './utils/analytics';

// 페이지뷰 추적 컴포넌트
function GAPageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  // GA 초기화
  useEffect(() => {
    initializeGA();
    debugGA(); // 개발 환경에서만 디버그 정보 출력
  }, []);
  return (
    <BrowserRouter>
      <ParticleBackground particleCount={18} intensity="heavy" />

      {/* GA 페이지뷰 추적 */}
      <GAPageTracker />

      <Routes>
        {/* 온보딩 라우팅 */}
        <Route path="/" element={<Onboarding1Page />} />
        <Route path="/onboarding/1" element={<Onboarding1Page />} />
        <Route path="/onboarding/2" element={<Onboarding2Page />} />
        <Route path="/onboarding/3" element={<Onboarding3Page />} />
        <Route path="/onboarding/4" element={<Onboarding4Page />} />
        <Route path="/onboarding/5" element={<Onboarding5Page />} />
        <Route path="/onboarding/card-draw" element={<CardDrawPage />} />
        <Route path="/onboarding/loading" element={<LoadingPage />} />

        {/* 디자인 확인용 데모 페이지 */}
        <Route path="/demo/loading" element={<LoadingPageDemo />} />

        {/* 결과 페이지 */}
        <Route path="/result/:resultId" element={<ResultPage />} />

        {/* 에러 페이지 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
