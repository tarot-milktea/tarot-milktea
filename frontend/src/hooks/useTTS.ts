import { useCallback } from 'react';
import { useTTSStore, parseAudioChunk } from '../store/ttsStore';
import { tarotApiService } from '../services/apiService';

export interface UseTTSOptions {
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoPlay?: boolean; // 오디오 데이터 준비 완료 시 자동 재생 여부
}

export const useTTS = (options: UseTTSOptions = {}) => {
  const { onComplete, onError, autoPlay = false } = options;

  const {
    status,
    error,
    progress,
    isPlaying,
    hasAudioData,
    isMuted,
    setStatus,
    setError,
    setProgress,
    setIsPlaying,
    setHasAudioData,
    setAbortController,
    stopAudio,
    getAudioPlayer,
    reset
  } = useTTSStore();

  // 전역 AudioPlayer 인스턴스 가져오기
  const audioPlayer = getAudioPlayer();

  // SSE 스트리밍으로 TTS 요청
  const requestTTSStream = useCallback(async (text: string, voice: string = 'nova', instructions?: string) => {
    if (isMuted) {
      console.log('🔇 TTS is muted, skipping request');
      return;
    }

    if (status === 'loading') {
      console.log('❌ Already loading, skipping request');
      return;
    }

    if (!text.trim()) {
      const errorMsg = '텍스트를 입력해주세요';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // 첫 번째 청크 잘림 방지를 위해 앞에 더미 글자 추가
    const processedText = '음 ' + text.trim();

    // 기존 작업이 있으면 중단
    stopAudio();

    // AbortController 생성
    const abortController = new AbortController();
    setAbortController(abortController);

    // 오디오 플레이어 초기화 및 리셋
    audioPlayer.reset();

    // 재생 콜백 설정
    audioPlayer.setCallbacks(
      () => {
        // 재생 시작 콜백
        setStatus('playing');
        setIsPlaying(true);
      },
      () => {
        // 재생 완료 콜백
        setStatus('idle');
        setIsPlaying(false);
        setAbortController(null);
        onComplete?.();
      }
    );

    setStatus('loading');
    setError(null);
    setProgress(0);
    setHasAudioData(false);

    try {
      const response = await tarotApiService.requestTTSStream(processedText, voice, instructions);

      if (!response.body) {
        throw new Error('Response body가 없습니다');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // AbortController로 중단 감지
      abortController.signal.addEventListener('abort', () => {
        reader.cancel();
      });

      while (true) {
        // 중단 신호 확인
        if (abortController.signal.aborted) {
          break;
        }

        const { done, value } = await reader.read();

        if (done) {
          setProgress(100);
          if (!autoPlay && hasAudioData) {
            setStatus('idle');
          }
          setAbortController(null);
          break;
        }

        // SSE 데이터 파싱
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();

            if (data === '[DONE]') {
              setProgress(100);
              if (!autoPlay && hasAudioData) {
                setStatus('idle');
              }
              return;
            }

            try {
              const eventData = JSON.parse(data);

              if (eventData.type === 'error') {
                throw new Error(eventData.error);
              } else if (eventData.type === 'speech.audio.delta' && eventData.audio) {
                // 중단 신호 재확인
                if (abortController.signal.aborted) {
                  break;
                }

                const audioData = parseAudioChunk(eventData.audio);
                if (audioData) {
                  if (autoPlay) {
                    await audioPlayer.addAndPlayChunk(audioData);
                  }

                  if (!hasAudioData) {
                    setHasAudioData(true);
                  }
                }
              } else if (eventData.type === 'speech.audio.done') {
                setProgress(100);
                if (!autoPlay && hasAudioData) {
                  setStatus('idle');
                }
                setAbortController(null);
                return;
              }

            } catch (parseError) {
              // JSON 파싱 에러 무시
            }
          }
        }

        // 진행률 업데이트 (임의)
        const currentProgress = progress;
        setProgress(Math.min(currentProgress + 10, 90));
      }

    } catch (error) {
      // 중단으로 인한 오류는 무시
      if (abortController.signal.aborted) {
        return;
      }

      const errorMsg = error instanceof Error ? error.message : 'TTS 요청에 실패했습니다';
      setError(errorMsg);
      setStatus('error');
      setAbortController(null);
      onError?.(errorMsg);
    }
  }, [isMuted, status, setStatus, setError, setProgress, progress, autoPlay, setHasAudioData, setAbortController, stopAudio, audioPlayer, onComplete, onError]);

  // 오디오 제어 함수들
  const playAudio = useCallback(async () => {
    // TODO: 수동 재생을 위한 스트리밍 로직 구현 필요
  }, []);

  const resetAudio = useCallback(() => {
    audioPlayer.reset();
    setHasAudioData(false);
    reset();
  }, [audioPlayer, reset, setHasAudioData]);

  return {
    // 상태
    status,
    error,
    progress,
    isPlaying,
    hasAudioData,
    isMuted,

    // 액션
    requestTTSStream,
    playAudio,
    stopAudio, // 전역 stopAudio 함수 사용
    reset: resetAudio,

    // 유틸리티
    isLoading: status === 'loading',
    hasError: status === 'error',
    hasAudio: audioPlayer?.hasAudio ?? false,
    canPlay: hasAudioData && !isPlaying && status !== 'loading' && status !== 'error',
  };
};