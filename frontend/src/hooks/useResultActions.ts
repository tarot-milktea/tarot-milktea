import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';
import { useSessionStore } from '../store/sessionStore';
import { useResultStore } from '../store/resultStore';
import { shareService } from '../services/resultService';
import { useResultTracking } from './useAnalytics';

/**
 * 결과 페이지 액션들을 관리하는 훅
 */
export const useResultActions = (resultId?: string) => {
  const navigate = useNavigate();
  const { resetSelection } = useCardStore();
  const { clearSession } = useSessionStore();
  const { resetResult } = useResultStore();
  const { trackShare, trackRestart } = useResultTracking(resultId);

  /**
   * 결과 공유하기
   */
  const handleShare = useCallback(async () => {
    if (!resultId) return;

    try {
      const shareMethod = await shareService.shareResult(resultId);
      trackShare(shareMethod);
    } catch (error) {
      console.error('Share failed:', error);
      // 에러는 서비스 레이어에서 처리됨
    }
  }, [resultId, trackShare]);

  /**
   * 새로운 타로 보기 (재시작)
   */
  const handleRestart = useCallback(() => {
    // Analytics 추적
    trackRestart();

    // 모든 상태 초기화
    resetSelection();    // 카드 스토어 초기화
    clearSession();      // 세션 스토어 초기화 (sessionStorage 포함)
    resetResult();       // 결과 스토어 초기화

    // 온보딩 페이지로 이동
    navigate('/');
  }, [trackRestart, resetSelection, clearSession, resetResult, navigate]);

  /**
   * 클립보드에 복사 (추가 옵션)
   */
  const handleCopyLink = useCallback(async () => {
    if (!resultId) return;

    try {
      await shareService.copyToClipboard(resultId);
      trackShare('clipboard');
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  }, [resultId, trackShare]);

  return {
    handleShare,
    handleRestart,
    handleCopyLink
  };
};