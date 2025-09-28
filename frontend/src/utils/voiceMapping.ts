// readerType에 따른 TTS 화자 매핑 유틸리티

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

/**
 * readerType 코드를 TTS 화자로 매핑합니다.
 * @param readerType - 리더 타입 코드 (T, F, FT 등)
 * @returns TTS 화자 이름
 */
export const getVoiceByReaderType = (readerType?: string): TTSVoice => {
  if (!readerType) return 'nova'; // 기본값

  const voiceMap: Record<string, TTSVoice> = {
    'T': 'nova',     // 타로 리더 -> nova (기본, 중성적인 목소리)
    'F': 'alloy',    // 포춘 텔러 -> alloy (따뜻하고 친근한 목소리)
    'FT': 'echo',    // 포춘 타로 -> echo (신비로운 목소리)
  };

  return voiceMap[readerType.toUpperCase()] || 'nova'; // 기본값 nova
};

/**
 * 사용 가능한 모든 화자 목록을 반환합니다.
 */
export const getAllVoices = (): TTSVoice[] => {
  return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
};

/**
 * 화자별 설명을 반환합니다.
 */
export const getVoiceDescription = (voice: TTSVoice): string => {
  const descriptions: Record<TTSVoice, string> = {
    'alloy': '따뜻하고 친근한 목소리',
    'echo': '신비롭고 몽환적인 목소리',
    'fable': '부드럽고 차분한 목소리',
    'onyx': '깊고 안정적인 목소리',
    'nova': '중성적이고 명확한 목소리',
    'shimmer': '밝고 경쾌한 목소리'
  };

  return descriptions[voice];
};