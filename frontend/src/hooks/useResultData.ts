import { useEffect, useRef } from 'react';
import { useResultStore, type ProcessingStatus } from '../store/resultStore';
import { useSessionStore } from '../store/sessionStore';
import { resultApiService, type ResultData } from '../services/resultService';

/**
 * 결과 데이터 로딩 및 폴링을 관리하는 훅
 */
export const useResultData = (resultId?: string) => {
  const pollingCleanup = useRef<(() => void) | null>(null);

  const {
    setSessionId,
    setCardInterpretation,
    setSummary,
    setAdviceImage,
    setProcessingStatus,
    cardInterpretations,
    summary,
    fortuneScore,
    adviceImageUrl,
    error: resultError
  } = useResultStore();

  const {
    restoreFromStorage,
    predefinedCards,
    fetchPredefinedCards
  } = useSessionStore();

  // 세션 데이터 복원 및 result store 초기화
  useEffect(() => {
    if (resultId) {
      setSessionId(resultId);
      restoreFromStorage();
    }
  }, [resultId, setSessionId, restoreFromStorage]);

  // 미리 정의된 카드 데이터 로딩 (공유 링크 대응)
  useEffect(() => {
    if (resultId && (!predefinedCards || predefinedCards.length === 0)) {
      const loadPredefinedCards = async () => {
        try {
          await fetchPredefinedCards();
        } catch (error) {
          console.error('Failed to fetch predefined cards for shared link:', error);
          // 카드 정보를 가져오지 못해도 텍스트는 보여줄 수 있으므로 에러를 throw하지 않음
        }
      };

      loadPredefinedCards();
    }
  }, [resultId, predefinedCards, fetchPredefinedCards]);

  // 결과 데이터 폴링 시작
  useEffect(() => {
    if (!resultId) return;

    const handleResultUpdate = (data: ResultData) => {
      // 카드 해석 업데이트
      if (data.interpretations?.past) {
        setCardInterpretation('past', data.interpretations.past);
      }
      if (data.interpretations?.present) {
        setCardInterpretation('present', data.interpretations.present);
      }
      if (data.interpretations?.future) {
        setCardInterpretation('future', data.interpretations.future);
      }

      // 종합 해석 및 점수 업데이트
      if (data.interpretations?.summary) {
        setSummary(data.interpretations.summary, data.fortuneScore || 0);
      }

      // 결과 이미지 업데이트
      if (data.resultImage?.url) {
        setAdviceImage(data.resultImage.url, data.resultImage.description);
      }

      // 처리 상태 업데이트
      if (data.status) {
        setProcessingStatus(data.status as ProcessingStatus, `상태: ${data.status}`, 100);
      }
    };

    const handlePollingComplete = () => {
      // console.log('Result data polling completed');
    };

    // 폴링 시작
    resultApiService.startPolling(
      resultId,
      handleResultUpdate,
      handlePollingComplete
    ).then((cleanup) => {
      pollingCleanup.current = cleanup;
    });

    // 클린업
    return () => {
      if (pollingCleanup.current) {
        pollingCleanup.current();
        pollingCleanup.current = null;
      }
    };
  }, [
    resultId,
    setCardInterpretation,
    setSummary,
    setAdviceImage,
    setProcessingStatus
  ]);

  return {
    // 결과 데이터
    cardInterpretations,
    summary,
    fortuneScore,
    adviceImageUrl,
    predefinedCards,

    // 상태
    isLoading: !cardInterpretations.past && !cardInterpretations.present && !cardInterpretations.future,
    hasError: Boolean(resultError),
    error: resultError,

    // 유틸리티
    hasAnyData: Boolean(
      cardInterpretations.past ||
      cardInterpretations.present ||
      cardInterpretations.future ||
      summary
    )
  };
};