import profaneFilter from '../components/etc/NicknameInput/profaneFilter';

/**
 * 질문 유효성 검사 함수
 */
export const validateQuestion = (question: string): string => {
  const trimmed = question.trim();

  if (trimmed.length < 10) {
    return '질문은 최소 10자 이상이어야 합니다';
  }

  if (trimmed.length > 200) {
    return '질문은 최대 200자까지 가능합니다';
  }

  // 질문에 적합한 문자 검증 (한글, 영문, 숫자, 기본 특수문자 허용)
  if (!/^[가-힣a-zA-Z0-9\s\.,!?\-~'"()]+$/.test(trimmed)) {
    return '한글, 영문, 숫자와 기본 특수문자만 사용 가능합니다';
  }

  if (profaneFilter.isProfane(trimmed)) {
    return '부적절한 내용이 포함되어 있습니다';
  }

  return ''; // 에러 없음
};