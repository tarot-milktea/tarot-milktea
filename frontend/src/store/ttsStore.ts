import { create } from 'zustand';

// Base64 오디오 데이터를 ArrayBuffer로 변환
export const parseAudioChunk = (base64Data: string): ArrayBuffer | null => {
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

export type TTSStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface TTSState {
  status: TTSStatus;
  error: string | null;
  progress: number; // 0-100
  isPlaying: boolean;
  hasAudioData: boolean; // 오디오 데이터가 준비되었는지
  isMuted: boolean; // 전역 음소거 상태
  abortController: AbortController | null; // SSE 연결 중단용
}

interface TTSActions {
  setStatus: (status: TTSStatus) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setHasAudioData: (hasAudioData: boolean) => void;
  setMuted: (isMuted: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  toggleMute: () => void;
  stopAudio: () => void; // 오디오 중단 전용 함수
  reset: () => void;
  getAudioPlayer: () => TTSStreamingAudioPlayer; // AudioPlayer 접근
}

// 전역 AudioPlayer 인스턴스
const globalAudioPlayer = new TTSStreamingAudioPlayer();

// localStorage에서 음소거 설정 로드
const loadMutedState = (): boolean => {
  try {
    const saved = localStorage.getItem('tts-muted');
    return saved ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
};

// localStorage에 음소거 설정 저장
const saveMutedState = (isMuted: boolean): void => {
  try {
    localStorage.setItem('tts-muted', JSON.stringify(isMuted));
  } catch {
    // localStorage 사용 불가능한 경우 무시
  }
};

// localStorage에서 TTS 활성화 설정 로드
const loadTTSEnabledState = (): boolean => {
  try {
    const saved = localStorage.getItem('ttsEnable');
    return saved ? JSON.parse(saved) : false; // 기본값: false (비활성화)
  } catch {
    return false;
  }
};

// TTS 활성화 상태 확인 함수
export const isTTSEnabled = (): boolean => {
  return loadTTSEnabledState();
};

const initialState: TTSState = {
  status: 'idle',
  error: null,
  progress: 0,
  isPlaying: false,
  hasAudioData: false,
  isMuted: loadMutedState(),
  abortController: null,
};

export const useTTSStore = create<TTSState & TTSActions>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({
    status,
    isPlaying: status === 'playing'
  }),

  setError: (error) => set({
    error,
    status: error ? 'error' : get().status,
    isPlaying: error ? false : get().isPlaying
  }),

  setProgress: (progress) => set({ progress }),

  setIsPlaying: (isPlaying) => set({
    isPlaying,
    status: isPlaying ? 'playing' : (get().status === 'playing' ? 'paused' : get().status)
  }),

  setHasAudioData: (hasAudioData) => set({ hasAudioData }),

  setMuted: (isMuted) => {
    saveMutedState(isMuted);
    set({ isMuted });
  },

  setAbortController: (controller) => set({ abortController: controller }),

  stopAudio: () => {
    const { abortController } = get();

    // SSE 연결 중단
    if (abortController) {
      abortController.abort();
    }

    // 오디오 재생 중단
    globalAudioPlayer.stop();

    // 상태 초기화
    set({
      isPlaying: false,
      status: 'idle',
      progress: 0,
      abortController: null,
    });
  },

  toggleMute: () => {
    const currentMuted = get().isMuted;
    const newMuted = !currentMuted;

    // 음소거 활성화 시 현재 재생 중인 TTS 즉시 중지
    if (newMuted && get().isPlaying) {
      // stopAudio 호출로 완전 중단
      get().stopAudio();
    }

    // 음소거 상태 변경 및 저장
    set({ isMuted: newMuted });
    saveMutedState(newMuted);
  },

  getAudioPlayer: () => globalAudioPlayer,

  reset: () => {
    // 진행 중인 모든 작업 중단
    get().stopAudio();
    // 음소거 설정은 유지하고 나머지는 초기화
    set({ ...initialState, isMuted: get().isMuted, abortController: null });
  },
}));