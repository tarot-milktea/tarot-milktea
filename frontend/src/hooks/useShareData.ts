import { useState, useEffect } from 'react';

// 카드 정보 인터페이스
export interface DrawnCard {
  position: number;
  cardId: number;
  nameKo: string;
  nameEn: string;
  orientation: 'upright' | 'reversed';
  videoUrl: string;
}

// 공유 페이지용 결과 데이터 인터페이스
export interface ShareResultData {
  sessionId: string;
  nickname: string;
  questionText: string;
  status: string;
  interpretations: {
    past: string;
    present: string;
    future: string;
    summary: string;
  };
  drawnCards: DrawnCard[];
  fortuneScore: number;
  resultImage: {
    url: string;
    description: string;
  };
}

/**
 * 공유 페이지에서 결과 데이터를 가져오는 훅
 * 폴링 없이 한 번만 API 호출하여 완성된 결과를 가져옴
 */
export const useShareData = (sessionId?: string) => {
  const [data, setData] = useState<ShareResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      setError('세션 ID가 제공되지 않았습니다.');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`https://j13a601.p.ssafy.io/api/sessions/${sessionId}/result`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // API 응답이 완료 상태가 아니면 오류
        if (result.status !== 'COMPLETED') {
          throw new Error('결과가 아직 생성되지 않았습니다.');
        }

        setData(result);
      } catch (err) {
        console.error('Failed to fetch share data:', err);
        setError(err instanceof Error ? err.message : '결과를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  return {
    data,
    isLoading,
    error,
    hasError: Boolean(error)
  };
};