import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingFlow from './components/OnboardingFlow';
import ResultPage from './pages/ResultPage';
import ErrorPage from './pages/ErrorPage';
import TempOnboardingPage from './pages/TempOnboardingPage';
import ParticleBackground from './components/common/ParticleBackground/ParticleBackground';

function App() {
  return (
    <BrowserRouter>
      <ParticleBackground particleCount={18} intensity="heavy" />
      <Routes>
        {/* 온보딩 플로우는 useState 방식 */}
        <Route path="/" element={<OnboardingFlow />} />

        {/* 임시 온보딩 페이지 - 디자인 테스트용 */}
        <Route path="/temp-onboarding" element={<TempOnboardingPage />} />

        {/* 결과 페이지만 라우팅 */}
        <Route path="/result/:resultId" element={<ResultPage />} />

        {/* 에러 페이지 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
