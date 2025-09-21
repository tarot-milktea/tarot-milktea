import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Onboarding1Page from './pages/Onboarding1Page';
import Onboarding2Page from './pages/Onboarding2Page';
import Onboarding3Page from './pages/Onboarding3Page';
import Onboarding4Page from './pages/Onboarding4Page';
import Onboarding5Page from './pages/Onboarding5Page';
import CardDrawPage from './pages/CardDrawPage';
import LoadingPage from './pages/LoadingPage';
import ResultPage from './pages/ResultPage';
import ErrorPage from './pages/ErrorPage';
import ParticleBackground from './components/common/ParticleBackground/ParticleBackground';

function App() {
  return (
    <BrowserRouter>
      <ParticleBackground particleCount={18} intensity="heavy" />
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

        {/* 결과 페이지 */}
        <Route path="/result/:resultId" element={<ResultPage />} />

        {/* 에러 페이지 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
