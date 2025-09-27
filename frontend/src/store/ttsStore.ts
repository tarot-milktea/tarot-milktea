import { create } from 'zustand';

export type TTSStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface TTSState {
  status: TTSStatus;
  error: string | null;
  progress: number; // 0-100
  isPlaying: boolean;
  hasAudioData: boolean; // 오디오 데이터가 준비되었는지
  isMuted: boolean; // 전역 음소거 상태
}

interface TTSActions {
  setStatus: (status: TTSStatus) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setHasAudioData: (hasAudioData: boolean) => void;
  setMuted: (isMuted: boolean) => void;
  toggleMute: () => void;
  reset: () => void;
}

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

const initialState: TTSState = {
  status: 'idle',
  error: null,
  progress: 0,
  isPlaying: false,
  hasAudioData: false,
  isMuted: loadMutedState(),
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

  toggleMute: () => {
    const currentMuted = get().isMuted;
    const newMuted = !currentMuted;

    // 음소거 활성화 시 현재 재생 중인 TTS 중지
    if (newMuted && get().isPlaying) {
      set({
        isMuted: newMuted,
        isPlaying: false,
        status: 'idle'
      });
    } else {
      set({ isMuted: newMuted });
    }

    saveMutedState(newMuted);
  },

  reset: () => set({ ...initialState, isMuted: get().isMuted }), // 음소거 설정은 유지
}));