import { apiClient } from '../utils/api';
import type { Category, Reader, PredefinedCard } from '../store/sessionStore';

export interface CreateSessionRequest {
  nickname: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  message?: string;
}

export interface SubmitSessionRequest {
  categoryCode: string;
  topicCode: string;
  questionText: string;
  readerType: string;
}

export interface SubmitSessionResponse {
  success: boolean;
  message?: string;
}

export interface GetTopicsResponse {
  categories: Category[];
}

export interface GetReadersResponse {
  readers: Reader[];
}

export interface GetPredefinedCardsResponse {
  cards: PredefinedCard[];
}


class TarotApiService {
  // 주제 목록 가져오기
  async getTopics(): Promise<Category[]> {
    try {
      const response = await apiClient.get<GetTopicsResponse>('/topics');
      return response.categories || [];
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      throw new Error('주제를 불러오는데 실패했습니다');
    }
  }

  // 리더 목록 가져오기
  async getReaders(): Promise<Reader[]> {
    try {
      const response = await apiClient.get<GetReadersResponse>('/readers');
      return response.readers || [];
    } catch (error) {
      console.error('Failed to fetch readers:', error);
      throw new Error('리더 목록을 불러오는데 실패했습니다');
    }
  }

  // 새로운 세션 생성
  async createSession(nickname: string): Promise<string> {
    try {
      const response = await apiClient.post<CreateSessionResponse>(
        '/sessions',
        { nickname }
      );

      if (!response.sessionId) {
        throw new Error('서버에서 세션 ID를 반환하지 않았습니다');
      }

      return response.sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('세션 생성에 실패했습니다');
    }
  }

  // 세션 데이터 제출
  async submitSessionData(
    sessionId: string,
    data: SubmitSessionRequest
  ): Promise<SubmitSessionResponse> {
    try {
      const response = await apiClient.post<SubmitSessionResponse>(
        `/sessions/${sessionId}/submit`,
        data
      );

      return response;
    } catch (error) {
      console.error('API 호출 실패:', error);
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
      }
      throw new Error('세션 데이터 제출에 실패했습니다');
    }
  }

  // 미리 정해진 카드들 가져오기
  async getPredefinedCards(sessionId: string): Promise<PredefinedCard[]> {
    try {
      const response = await apiClient.get<GetPredefinedCardsResponse>(
        `/sessions/${sessionId}/cards`
      );

      return response.cards || [];
    } catch (error) {
      console.error('Failed to fetch predefined cards:', error);
      throw new Error('미리 정해진 카드를 불러오는데 실패했습니다');
    }
  }

  // 데이터 초기화 (주제 + 리더 동시 로드)
  async initializeAppData(): Promise<{ categories: Category[]; readers: Reader[] }> {
    try {
      // Promise.all로 병렬 처리 - 성능 최적화!
      const [categories, readers] = await Promise.all([
        this.getTopics(),
        this.getReaders()
      ]);

      return { categories, readers };
    } catch (error) {
      console.error('Failed to initialize app data:', error);
      throw new Error('앱 데이터 초기화에 실패했습니다');
    }
  }

  // 전체 세션 플로우 (세션 생성 + 카드 가져오기)
  async createSessionWithCards(nickname: string): Promise<{
    sessionId: string;
    predefinedCards: PredefinedCard[];
  }> {
    try {
      // 1. 세션 생성
      const sessionId = await this.createSession(nickname);

      // 2. 미리 정해진 카드들 가져오기
      const predefinedCards = await this.getPredefinedCards(sessionId);

      return { sessionId, predefinedCards };
    } catch (error) {
      console.error('Failed to create session with cards:', error);
      throw new Error('세션 생성 및 카드 로드에 실패했습니다');
    }
  }
}

export const tarotApiService = new TarotApiService();