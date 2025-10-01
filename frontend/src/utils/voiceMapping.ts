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
    'T': 'onyx',     // 타로 리더 -> onyx (차분하고 신중한 남성의 목소리)
    'F': 'nova',     // 포춘 텔러 -> nova (친근하고 따뜻한 여성의 목소리)
    'FT': 'fable',   // 포춘 타로 -> fable (신비롭고 매력적인 목소리)
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

/**
 * TTS용 텍스트 전처리 함수
 * @param text - 전처리할 텍스트
 * @returns 전처리된 텍스트
 */
export const preprocessTextForTTS = (text: string): string => {
  return text.replace(/ssafy/gi, '싸피');
};

/**
 * readerType에 따른 TTS 설정을 반환합니다.
 * @param readerType - 리더 타입 코드 (T, F, FT 등)
 * @param readerName - 리더 이름
 * @returns TTS 설정 객체 (voice, instruction, text)
 */
export const getTTSSettings = (readerType: string, readerName: string) => {
  const baseText = `안녕하세요, 저는 ${readerName}입니다. 당신의 타로 리더가 되어 운명의 길을 안내해드리겠습니다.`;

  switch (readerType) {
    case "F":
      return {
        voice: "nova" as const,
        instruction:
          "친근하고 따뜻한 여성의 목소리로, 마치 가까운 언니나 친구가 조언해주는 것처럼 부드럽고 다정하게 말해주세요.",
        text: `${baseText}`,
      };
    case "T":
      return {
        voice: "onyx" as const,
        instruction:
          "차분하고 신중한 남성의 목소리로, 깊이 있고 진중한 톤으로 신뢰감 있게 말해주세요.",
        text: `${baseText}`,
      };
    case "FT":
      return {
        voice: "fable" as const,
        instruction:
          "신비롭고 매력적인 목소리로, 마치 고대의 현자가 운명을 읽어주는 것처럼 신비로우면서도 따뜻하게 말해주세요.",
        text: `${baseText}`,
      };
    default:
      return {
        voice: "nova" as const,
        instruction: "친근하고 자연스러운 목소리로 말해주세요.",
        text: baseText,
      };
  }
};