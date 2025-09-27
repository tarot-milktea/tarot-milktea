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
    setNickname,
    setQuestionText,
    setCardInterpretation,
    setSummary,
    setLuckyCard,
    setProcessingStatus,
    cardInterpretations,
    summary,
    fortuneScore,
    luckyCard,
    nickname,
    questionText,
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

    // 현재 세션의 resultId를 캡처하여 클로저로 보관
    const currentSessionId = resultId;
    console.log(`[Polling] Starting polling for session: ${currentSessionId}`);

    const handleResultUpdate = (data: ResultData) => {
      // CRITICAL: 폴링 시작 시점의 sessionId와 현재 resultId가 일치하는지 확인
      // 이전 세션의 데이터가 현재 세션에 섞이는 것을 방지
      if (resultId !== currentSessionId) {
        console.warn(`[ResultData] Ignoring stale data from session ${currentSessionId}, current session: ${resultId}`);
        return;
      }

      console.log(`[ResultData] Processing data for session: ${currentSessionId}`);

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

      // 닉네임 업데이트
      if (data.nickname) {
        setNickname(data.nickname);
      }
      // 질문 텍스트 업데이트
      if (data.questionText) {
        setQuestionText(data.questionText);
      }

      // 행운 카드 업데이트
      if (data.luckyCard?.name && data.luckyCard?.message && data.luckyCard?.imageUrl) {
        setLuckyCard(data.luckyCard.name, data.luckyCard.message, data.luckyCard.imageUrl);
      }

      // 처리 상태 업데이트
      if (data.status) {
        setProcessingStatus(data.status as ProcessingStatus, `상태: ${data.status}`, 100);
      }
    };

    const handlePollingComplete = () => {
      console.log(`[Polling] Completed for session: ${currentSessionId}`);
    };

    // 폴링 시작
    resultApiService.startPolling(
      currentSessionId,
      handleResultUpdate,
      handlePollingComplete
    ).then((cleanup) => {
      pollingCleanup.current = cleanup;
    });

    // 클린업
    return () => {
      console.log(`[Polling] Cleaning up for session: ${currentSessionId}`);
      if (pollingCleanup.current) {
        pollingCleanup.current();
        pollingCleanup.current = null;
      }
    };
  }, [
    resultId,
    setCardInterpretation,
    setSummary,
    setLuckyCard,
    setProcessingStatus,
    setNickname,
    setQuestionText
  ]);

  return {
    // 결과 데이터
    cardInterpretations,
    summary,
    fortuneScore,
    luckyCard,
    predefinedCards,
    nickname,
    questionText,

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