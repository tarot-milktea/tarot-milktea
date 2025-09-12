import { create } from 'zustand';

export interface SelectedCard {
  id: number;                           // 카드 고유 ID (1~72)
  position: 'past' | 'present' | 'future'; // 카드가 나타내는 시간대
  orientation: 'upright' | 'reversed';  // 카드 방향 (정방향/역방향)
}

interface CardState {
  selectedCards: SelectedCard[];        // 현재 선택된 카드들 (최대 3개)
  isRevealing: boolean;                // 카드 뒤집기 애니메이션이 시작되었는지 여부
  revealedCards: number[];             // 이미 뒤집힌 카드들의 ID 목록
  
  selectCard: (cardId: number) => void;    // 카드 선택하기
  deselectCard: (cardId: number) => void;  // 카드 선택 취소하기
  startReveal: () => void;                 // 뒤집기 애니메이션 시작
  revealCard: (cardId: number) => void;    // 특정 카드 뒤집기
  resetSelection: () => void;              // 모든 선택 초기화
}

export const useCardStore = create<CardState>((set, get) => ({
  selectedCards: [],    // 빈 배열로 시작
  isRevealing: false,   // 뒤집기 애니메이션 꺼짐
  revealedCards: [],    // 뒤집힌 카드 없음

  
  selectCard: (cardId: number) => {
    const { selectedCards } = get(); 
    
    if (selectedCards.length >= 3) return;
    
    if (selectedCards.some(card => card.id === cardId)) return;
    
    // 카드 순서대로 과거 → 현재 → 미래 위치 자동 할당
    const positions: ('past' | 'present' | 'future')[] = ['past', 'present', 'future'];
    // 랜덤하게 정/역방향 결정 (50% 확률)
    const randomOrientation: 'upright' | 'reversed' = Math.random() < 0.5 ? 'upright' : 'reversed';
    const newCard: SelectedCard = {
      id: cardId,
      position: positions[selectedCards.length],
      orientation: randomOrientation
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
      revealedCards: []     
    });
  }
}));