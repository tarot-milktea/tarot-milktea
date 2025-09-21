import type {
  Category,
  Topic,
  Reader,
  PredefinedCard
} from '../store/sessionStore';

export interface TarotResult {
  cards: Array<{
    id: number;
    position: 'past' | 'present' | 'future';
    orientation: 'upright' | 'reversed';
  }>;
  nickname?: string;
  topic?: string;
  question?: string;
}

export interface SelectedCard {
  id: number;
  position: 'past' | 'present' | 'future';
  orientation: 'upright' | 'reversed';
}

export interface SessionData {
  nickname: string;
  selectedCategory: Category | null;
  selectedTopic: Topic | null;
  selectedQuestion: string;
  selectedReader: Reader | null;
  sessionId: string | null;
  predefinedCards: PredefinedCard[];
}

// 에러 타입 정의
export class StorageError extends Error {
  cause?: Error;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

// 타입 가드 함수들: 저장소에서 불러온 데이터가 우리가 원하는 형태인지 검사
function isValidTarotResult(data: unknown): data is TarotResult {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj.cards) &&
    obj.cards.every((card: unknown) => {
      if (!card || typeof card !== 'object') return false;
      const cardObj = card as Record<string, unknown>;
      return (
        typeof cardObj.id === 'number' &&
        ['past', 'present', 'future'].includes(cardObj.position as string) &&
        ['upright', 'reversed'].includes(cardObj.orientation as string)
      );
    })
  );
}

function isValidSelectedCards(data: unknown): data is SelectedCard[] {
  if (!Array.isArray(data)) return false;

  return data.every((card: unknown) => {
    if (!card || typeof card !== 'object') return false;
    const cardObj = card as Record<string, unknown>;
    return (
      typeof cardObj.id === 'number' &&
      ['past', 'present', 'future'].includes(cardObj.position as string) &&
      ['upright', 'reversed'].includes(cardObj.orientation as string)
    );
  });
}

// SessionData 검증을 위한 타입 가드
function isValidSessionData(data: unknown): data is Partial<SessionData> {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // 필수 필드들 검증 (optional이 아닌 것들)
  if (typeof obj.nickname !== 'string') return false;
  if (typeof obj.selectedQuestion !== 'string') return false;

  // optional 필드들은 있으면 타입 검증, 없으면 패스
  if (obj.sessionId !== undefined && obj.sessionId !== null && typeof obj.sessionId !== 'string') {
    return false;
  }

  return true;
}

// 스토리지 서비스 클래스
class StorageService {
  // 안전한 데이터 저장 (localStorage)
  saveToLocalStorage<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      // localStorage가 꽉 찼거나, 브라우저가 지원하지 않는 경우
      console.error(`Failed to save to localStorage (key: ${key}):`, error);
      throw new StorageError(`저장에 실패했습니다: ${key}`, error as Error);
    }
  }

  // 안전한 데이터 불러오기 (localStorage)
  loadFromLocalStorage<T>(key: string, validator?: (data: unknown) => data is T): T | null {
    try {
      const serializedData = localStorage.getItem(key);

      if (!serializedData) {
        return null; // 데이터가 없는 경우
      }

      const parsedData = JSON.parse(serializedData);

      // 검증 함수가 있으면 데이터 검증
      if (validator && !validator(parsedData)) {
        console.warn(`Invalid data format for key: ${key}`);
        return null;
      }

      return parsedData;
    } catch (error) {
      // JSON 파싱 에러나 기타 에러 처리
      console.error(`Failed to load from localStorage (key: ${key}):`, error);
      return null;
    }
  }

  // 데이터 삭제 (localStorage)
  removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage (key: ${key}):`, error);
    }
  }

  // sessionStorage 저장 (브라우저 탭을 닫으면 사라지는 저장소)
  saveToSessionStorage<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      sessionStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Failed to save to sessionStorage (key: ${key}):`, error);
      throw new StorageError(`세션 저장에 실패했습니다: ${key}`, error as Error);
    }
  }

  // sessionStorage 불러오기
  loadFromSessionStorage<T>(key: string, validator?: (data: unknown) => data is T): T | null {
    try {
      const serializedData = sessionStorage.getItem(key);

      if (!serializedData) {
        return null;
      }

      const parsedData = JSON.parse(serializedData);

      if (validator && !validator(parsedData)) {
        console.warn(`Invalid session data format for key: ${key}`);
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error(`Failed to load from sessionStorage (key: ${key}):`, error);
      return null;
    }
  }

  // sessionStorage 삭제
  removeFromSessionStorage(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from sessionStorage (key: ${key}):`, error);
    }
  }

  // 타로 결과 저장
  saveTarotResult(resultId: string, result: TarotResult): void {
    this.saveToLocalStorage(`tarot_${resultId}`, result);
  }

  // 타로 결과 불러오기
  loadTarotResult(resultId: string): TarotResult | null {
    return this.loadFromLocalStorage(`tarot_${resultId}`, isValidTarotResult);
  }

  // 선택된 카드들 저장
  saveSelectedCards(cards: SelectedCard[]): void {
    this.saveToLocalStorage('selectedCards', cards);
  }

  // 선택된 카드들 불러오기
  loadSelectedCards(): SelectedCard[] | null {
    return this.loadFromLocalStorage('selectedCards', isValidSelectedCards);
  }

  // 세션 데이터 저장
  saveSessionData(data: SessionData): void {
    this.saveToSessionStorage('tarot_session_data', data);
  }

  // 세션 데이터 불러오기
  loadSessionData(): Partial<SessionData> | null {
    return this.loadFromSessionStorage('tarot_session_data', isValidSessionData);
  }

  // 세션 데이터 삭제
  clearSessionData(): void {
    this.removeFromSessionStorage('tarot_session_data');
  }
}

// 싱글톤 패턴: 앱 전체에서 하나의 StorageService 인스턴스만 사용
export const storageService = new StorageService();