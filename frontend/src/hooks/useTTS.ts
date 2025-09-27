import { useCallback, useRef, useEffect } from 'react';
import { useTTSStore } from '../store/ttsStore';
import { tarotApiService } from '../services/apiService';

export interface UseTTSOptions {
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoPlay?: boolean; // 오디오 데이터 준비 완료 시 자동 재생 여부
}

// Base64 오디오 데이터를 ArrayBuffer로 변환
const parseAudioChunk = (base64Data: string): ArrayBuffer | null => {
  try {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    return null;
  }
};

// 실시간 스트리밍 오디오 재생을 위한 Web Audio API 클래스
class TTSStreamingAudioPlayer {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private isPlaying = false;
  private nextStartTime = 0;
  private audioSources: AudioBufferSourceNode[] = [];
  private onPlaybackComplete?: () => void;
  private onPlaybackStart?: () => void;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // AudioContext 생성
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      // iOS Safari에서는 사용자 상호작용 후 resume 필요
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
    } catch (error) {
      throw error;
    }
  }

  setCallbacks(onStart?: () => void, onComplete?: () => void) {
    this.onPlaybackStart = onStart;
    this.onPlaybackComplete = onComplete;
  }

  async addAndPlayChunk(arrayBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (!this.audioContext) return;

    try {
      // ArrayBuffer를 AudioBuffer로 디코딩
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));

      // 첫 번째 청크인 경우 재생 시작
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.nextStartTime = this.audioContext.currentTime;
        this.onPlaybackStart?.();
      }

      // AudioBufferSourceNode 생성 및 스케줄링
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      // 현재 시간 또는 이전 청크 종료 시점에 재생 시작
      const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
      source.start(startTime);

      // 다음 청크의 시작 시간 계산
      this.nextStartTime = startTime + audioBuffer.duration;

      // 소스 추적을 위해 배열에 추가
      this.audioSources.push(source);

      // 재생 완료 이벤트 리스너
      source.onended = () => {
        // 마지막 청크인지 확인하기 위해 약간의 지연 후 체크
        setTimeout(() => {
          const currentTime = this.audioContext!.currentTime;
          const hasMorePending = this.audioSources.some(src =>
            src !== source && src.buffer && currentTime < (src as any).startTime + src.buffer.duration
          );

          if (!hasMorePending && currentTime >= this.nextStartTime - 0.1) {
            // 모든 재생이 완료됨
            this.isPlaying = false;
            this.onPlaybackComplete?.();
          }
        }, 100);
      };

    } catch (error) {
      // 오디오 처리 실패 무시
    }
  }

  stop(): void {
    this.audioSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // 이미 정지된 소스는 무시
      }
    });
    this.audioSources = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }

  reset(): void {
    this.stop();
  }

  get hasAudio(): boolean {
    return this.audioSources.length > 0 || this.isPlaying;
  }

  get isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

export const useTTS = (options: UseTTSOptions = {}) => {
  const { onComplete, onError, autoPlay = false } = options;
  const audioPlayerRef = useRef<TTSStreamingAudioPlayer>(new TTSStreamingAudioPlayer());

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
    reset
  } = useTTSStore();

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

    // 오디오 플레이어 초기화 및 리셋
    audioPlayerRef.current.reset();

    // 재생 콜백 설정
    audioPlayerRef.current.setCallbacks(
      () => {
        // 재생 시작 콜백
        setStatus('playing');
        setIsPlaying(true);
      },
      () => {
        // 재생 완료 콜백
        setStatus('idle');
        setIsPlaying(false);
        onComplete?.();
      }
    );

    setStatus('loading');
    setError(null);
    setProgress(0);
    setHasAudioData(false);

    try {
      const response = await tarotApiService.requestTTSStream(text, voice, instructions);

      if (!response.body) {
        throw new Error('Response body가 없습니다');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setProgress(100);
          if (!autoPlay && hasAudioData) {
            setStatus('idle');
          }
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
                const audioData = parseAudioChunk(eventData.audio);
                if (audioData) {
                  if (autoPlay) {
                    await audioPlayerRef.current.addAndPlayChunk(audioData);
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
      const errorMsg = error instanceof Error ? error.message : 'TTS 요청에 실패했습니다';
      setError(errorMsg);
      setStatus('error');
      onError?.(errorMsg);
    }
  }, [isMuted, status, setStatus, setError, setProgress, progress, autoPlay, setHasAudioData, onComplete, onError]);

  // 오디오 제어 함수들
  const playAudio = useCallback(async () => {
    // TODO: 수동 재생을 위한 스트리밍 로직 구현 필요
  }, []);

  const stopAudio = useCallback(() => {
    audioPlayerRef.current.stop();
    setStatus('idle');
    setIsPlaying(false);
  }, [setStatus, setIsPlaying]);

  const resetAudio = useCallback(() => {
    audioPlayerRef.current.reset();
    setHasAudioData(false);
    reset();
  }, [reset, setHasAudioData]);

  // 음소거 상태 변화 감지하여 실제 오디오 중지
  useEffect(() => {
    if (isMuted && isPlaying) {
      audioPlayerRef.current.stop();
    }
  }, [isMuted, isPlaying]);

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
    stopAudio,
    reset: resetAudio,

    // 유틸리티
    isLoading: status === 'loading',
    hasError: status === 'error',
    hasAudio: audioPlayerRef.current?.hasAudio ?? false,
    canPlay: hasAudioData && !isPlaying && status !== 'loading' && status !== 'error',
  };
};