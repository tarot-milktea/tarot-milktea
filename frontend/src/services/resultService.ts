import { showToast } from '../components/common/Toast';
import { trackError } from '../utils/analytics';

// 결과 데이터 인터페이스
export interface ResultData {
  nickname?: string;
  questionText?: string;
  interpretations?: {
    past?: string;
    present?: string;
    future?: string;
    summary?: string;
  };
  fortuneScore?: number;
  luckyCard?: {
    name: string;
    message: string;
    imageUrl: string;
  };
  status?: string;
}

// 공유 방법 타입
export type ShareMethod = 'native' | 'clipboard';

/**
 * 결과 API 서비스 클래스
 */
class ResultApiService {
  private readonly baseUrl = 'https://j13a601.p.ssafy.io/api';

  /**
   * 결과 데이터를 가져오는 API 호출
   */
  async fetchResultData(sessionId: string): Promise<ResultData> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/result`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch result data:', error);
      trackError('api_error', `Result fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'result_service');
      throw error;
    }
  }

  /**
   * 결과 데이터 폴링 (5초 간격)
   */
  async startPolling(
    sessionId: string,
    onUpdate: (data: ResultData) => void,
    onComplete: () => void
  ): Promise<() => void> {
    let polling = true;
    let timeoutId: number | null = null;

    const poll = async () => {
      if (!polling) return;

      try {
        const data = await this.fetchResultData(sessionId);

        // sessionId가 현재 폴링 대상과 일치하는지 확인
        if (!polling) return; // 중간에 취소되었을 수 있음

        onUpdate(data);

        // 완료 상태면 폴링 중단
        if (data.status === 'COMPLETED') {
          polling = false;
          onComplete();
          return;
        }

        // 계속 폴링
        if (polling) {
          timeoutId = window.setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error('Polling error:', error);
        // 에러 발생해도 계속 폴링 (네트워크 일시 장애 대응)
        if (polling) {
          timeoutId = window.setTimeout(poll, 5000);
        }
      }
    };

    // 초기 호출
    poll();

    // 폴링 중단 함수 반환
    return () => {
      polling = false;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }
}

/**
 * 공유 기능 서비스 클래스
 */
class ShareService {
  /**
   * 결과 공유하기
   */
  async shareResult(resultId: string): Promise<ShareMethod> {
    const shareUrl = `${window.location.origin}/share/${resultId}`;

    try {
      // Web Share API 지원 여부 확인
      if (navigator.share) {
        await navigator.share({
          title: '🔮 내 타로 결과',
          text: '타로 인사이트로 본 내 운세를 확인해보세요!',
          url: shareUrl,
        });
        return 'native';
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(shareUrl);
        showToast.success('링크가 클립보드에 복사되었습니다! 📋');
        return 'clipboard';
      }
    } catch (error) {
      console.error('Share failed:', error);
      showToast.error('공유에 실패했습니다');
      trackError('share_failed', '공유 실패', 'result_page');
      throw error;
    }
  }

  /**
   * URL 복사하기 (fallback)
   */
  async copyToClipboard(resultId: string): Promise<void> {
    const shareUrl = `${window.location.origin}/share/${resultId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast.success('링크가 클립보드에 복사되었습니다! 📋');
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      showToast.error('클립보드 복사에 실패했습니다');
      trackError('clipboard_failed', '클립보드 복사 실패', 'result_page');
      throw error;
    }
  }
}

/**
 * 결과 유틸리티 서비스 클래스
 */
class ResultUtilService {
  /**
   * 결과 ID 유효성 검사
   */
  isValidResultId(resultId?: string): boolean {
    return Boolean(resultId && resultId.trim().length > 0);
  }

  /**
   * 로딩 상태 메시지 생성
   */
  getLoadingMessage(hasData: boolean): string {
    return hasData ? '추가 결과를 불러오는 중...' : '결과를 불러오는 중...';
  }

  /**
   * 처리 상태에 따른 메시지 생성
   */
  getStatusMessage(status?: string): string {
    switch (status) {
      case 'PROCESSING':
        return '결과를 생성하고 있습니다...';
      case 'COMPLETED':
        return '모든 해석이 완료되었습니다!';
      case 'ERROR':
        return '결과 생성 중 오류가 발생했습니다.';
      default:
        return '결과를 준비하고 있습니다...';
    }
  }

  /**
   * 점수에 따른 메시지 생성
   */
  getFortuneMessage(score: number): string {
    if (score >= 80) return '매우 좋은 운세입니다! ✨';
    if (score >= 60) return '좋은 운세네요! 😊';
    if (score >= 40) return '보통의 운세입니다. 😐';
    if (score >= 20) return '조금 주의가 필요해요. 😰';
    return '어려운 시기이지만 극복할 수 있어요! 💪';
  }
}

// 서비스 인스턴스 생성 및 내보내기
export const resultApiService = new ResultApiService();
export const shareService = new ShareService();
export const resultUtilService = new ResultUtilService();