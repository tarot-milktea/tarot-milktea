import profaneFilter from '../components/etc/NicknameInput/profaneFilter';

// 닉네임 형용사
const mysticalAdjectives = [
  '신비로운', '몽환적인', '신성한', '마법의', '운명적인', '예언하는',
  '달빛의', '별빛의', '우주의', '영원한', '초월적인', '환상적인',
  '신비한', '마법적인', '천상의', '수정같은', '은빛의', '금빛의',
  '무지개의', '꿈꾸는', '점성의', '카드를', '미래를', '과거를',
  '현재의', '시공의', '차원의', '영혼의', '마음의', '운명을'
];

// 닉네임 명사
const mysticalNouns = [
  '타로마스터', '카드리더', '점성술사', '예언자', '마법사', '현자',
  '여신', '수호자', '수정구슬', '마법서', '룬스톤', '펜듈럼', '드램캐처',
  '유니콘', '피닉스', '드래곤', '페가수스', '그리핀', '문스톤',
  '은여우', '흰늑대', '검은고양이', '올빼미', '까마귀', '백조',
  '달토끼', '별나비', '무지개새', '크리스털', '오로라', '미스트'
];

export const generateRandomNickname = (): string => {
  let attempts = 0;
  const maxAttempts = 100; // 무한루프 방지

  while (attempts < maxAttempts) {
    const randomAdj = mysticalAdjectives[Math.floor(Math.random() * mysticalAdjectives.length)];
    const randomNoun = mysticalNouns[Math.floor(Math.random() * mysticalNouns.length)];
    const randomNum = Math.floor(Math.random() * 99) + 1;

    const nickname = `${randomAdj} ${randomNoun}${randomNum}`;

    // 길이 체크 (12자 초과시 재생성)
    if (nickname.length > 12) {
      attempts++;
      continue;
    }

    // 욕설 필터링 검사
    if (!profaneFilter.isProfane(nickname)) {
      return nickname;
    }

    attempts++;
  }

  // 최후의 수단으로 타임스탬프 기반 닉네임 생성
  const timestamp = Date.now().toString().slice(-4);
  return `신비한점성술사${timestamp}`.slice(0, 12);
};

/**
 * 여러 개의 랜덤 닉네임을 생성합니다.
 */
export const generateRandomNicknames = (count: number): string[] => {
  const nicknames: string[] = [];

  for (let i = 0; i < count; i++) {
    nicknames.push(generateRandomNickname());
  }

  return nicknames;
};

/**
 * 닉네임 유효성 검사 함수
 */
export const validateNickname = (nickname: string): string => {
  const trimmed = nickname.trim();

  if (trimmed.length < 2) {
    return '닉네임은 최소 2자 이상이어야 합니다';
  }

  if (trimmed.length > 12) {
    return '닉네임은 최대 12자까지 가능합니다';
  }

  if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmed)) {
    return '한글, 영문, 숫자만 사용 가능합니다';
  }

  if (profaneFilter.isProfane(trimmed)) {
    return '부적절한 닉네임입니다';
  }

  return ''; // 에러 없음
};