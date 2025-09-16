import { create } from 'zustand';

export interface SelectedCard {
  id: number;                           // 카드 고유 ID (1~72)
  position: 'past' | 'present' | 'future'; // 카드가 나타내는 시간대
  orientation: 'upright' | 'reversed';  // 카드 방향 (정방향/역방향)
}

export interface PredeterminedCard {
  position: number;                     // 카드 위치 (1, 2, 3)
  cardId: number;                       // 카드 ID
  nameKo: string;                       // 한국어 카드명
  nameEn: string;                       // 영어 카드명
  orientation: 'upright' | 'reversed'; // 카드 방향
  imageUrl: string;                     // 카드 이미지 URL
  meaning: string;                      // 카드 의미
}

interface CardState {
  // 사용자 선택용 (UI 전용)
  selectedCards: SelectedCard[];        // 현재 선택된 카드들 (최대 3개)
  isRevealing: boolean;                // 카드 뒤집기 애니메이션이 시작되었는지 여부
  revealedCards: number[];             // 이미 뒤집힌 카드들의 ID 목록

  // 백엔드에서 미리 정한 카드들 (실제 결과용)
  predeterminedCards: PredeterminedCard[] | null;

  // 기존 액션들
  selectCard: (cardId: number) => void;    // 카드 선택하기
  deselectCard: (cardId: number) => void;  // 카드 선택 취소하기
  startReveal: () => void;                 // 뒤집기 애니메이션 시작
  revealCard: (cardId: number) => void;    // 특정 카드 뒤집기
  resetSelection: () => void;              // 모든 선택 초기화

  // 새로운 액션들
  setPredeterminedCards: (cards: PredeterminedCard[]) => void;
  simulateCardSelection: (selectedCardIds: number[]) => void; // 미리 정한 카드가 선택되도록 조작
}

export const useCardStore = create<CardState>((set, get) => ({
  selectedCards: [],    // 빈 배열로 시작
  isRevealing: false,   // 뒤집기 애니메이션 꺼짐
  revealedCards: [],    // 뒤집힌 카드 없음
  predeterminedCards: null, // 미리 정한 카드 없음


  selectCard: (cardId: number) => {
    const { selectedCards } = get();

    if (selectedCards.length >= 3) return;

    if (selectedCards.some(card => card.id === cardId)) return;

    // 카드 순서대로 과거 → 현재 → 미래 위치 자동 할당
    const positions: ('past' | 'present' | 'future')[] = ['past', 'present', 'future'];
    const newCard: SelectedCard = {
      id: cardId,
      position: positions[selectedCards.length],
      orientation: 'upright' // 기본값, 실제로는 predefinedCard의 orientation 사용
    };

    set({ selectedCards: [...selectedCards, newCard] });
  },

  deselectCard: (cardId: number) => {
    const { selectedCards, isRevealing } = get();

    if (isRevealing) return;

    const filteredCards = selectedCards.filter(card => card.id !== cardId);

    const repositionedCards = filteredCards.map((card, index) => ({
      ...card,
      position: (['past', 'present', 'future'] as const)[index]
    }));

    set({ selectedCards: repositionedCards });
  },


  startReveal: () => {
    const { selectedCards } = get();

    if (selectedCards.length === 3) {
      // localStorage에 선택된 카드 정보 저장
      localStorage.setItem('selectedCards', JSON.stringify(selectedCards));

      set({
        isRevealing: true,
        revealedCards: []
      });
    }
  },

  revealCard: (cardId: number) => {
    const { revealedCards } = get();

    if (!revealedCards.includes(cardId)) {
      set({ revealedCards: [...revealedCards, cardId] });
    }
  },

  resetSelection: () => {
    set({
      selectedCards: [],
      isRevealing: false,
      revealedCards: [],
      predeterminedCards: null
    });
  },

  setPredeterminedCards: (cards: PredeterminedCard[]) => {
    set({ predeterminedCards: cards });
  },

  simulateCardSelection: (selectedCardIds: number[]) => {
    const { predeterminedCards } = get();

    if (!predeterminedCards || selectedCardIds.length !== 3) return;

    // 사용자가 선택한 카드 ID와 미리 정한 카드를 매핑
    const positions: ('past' | 'present' | 'future')[] = ['past', 'present', 'future'];
    const simulatedCards: SelectedCard[] = predeterminedCards.map((predetermined, index) => ({
      id: selectedCardIds[index], // 사용자가 선택한 카드 ID (UI용)
      position: positions[index],
      orientation: predetermined.orientation // 백엔드가 정한 방향 사용
    }));

    set({ selectedCards: simulatedCards });
  }
}));