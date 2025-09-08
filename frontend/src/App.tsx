import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingFlow from './components/OnboardingFlow';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 온보딩 플로우는 useState 방식 */}
        <Route path="/" element={<OnboardingFlow />} />
        
        {/* 결과 페이지만 라우팅 */}
        <Route path="/result/:resultId" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
