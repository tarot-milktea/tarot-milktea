import styled from '@emotion/styled';
import { useCardStore } from '../../store/cardStore';
import TarotCard from '../../components/TarotCard';
import Button from '../../components/Button';
import ButtonGroup from '../../components/ButtonGroup';

interface CardDrawPageProps {
  onNext: () => void;
  onPrev: () => void;
}

function CardDrawPage({ onNext, onPrev }: CardDrawPageProps) {
  const { selectedCards, isRevealing, startReveal, revealCard, resetSelection } = useCardStore();

  const handleReset = () => {
    resetSelection();
  };

  const handleConfirm = () => {
    if (selectedCards.length === 3) {
      startReveal();
      
      // 순차적으로 카드 뒤집기
      selectedCards.forEach((card, index) => {
        setTimeout(() => {
          revealCard(card.id);
        }, index * 800);
      });
    }
  };

  return (
    <Container>
      <Character>
        🔮
      </Character>

      <Title>
        카드를 선택해주세요
      </Title>
      
      <Description>
        72장의 카드 중 3장을 선택하시면 과거, 현재, 미래를 알려드립니다
      </Description>

      <CardSection>
        {!isRevealing ? (
          <>
            <CardGrid>
              {Array.from({ length: 72 }, (_, index) => (
                <TarotCard key={index + 1} cardId={index + 1} size="small" showOrientationToggle={true} />
              ))}
            </CardGrid>
            
          </>
        ) : (
          <RevealSection>
            <RevealTitle>선택하신 카드입니다</RevealTitle>
            <RevealGrid>
              {selectedCards.map((selectedCard) => (
                <RevealCardContainer key={selectedCard.id}>
                  <TarotCard cardId={selectedCard.id} size="large" showOrientationToggle={false} />
                </RevealCardContainer>
              ))}
            </RevealGrid>
            <ButtonGroup gap="large">
              <Button variant="ghost" size="medium" onClick={onPrev}>
                이전
              </Button>
              <Button variant="secondary" size="medium" onClick={handleReset}>
                다시 선택하기
              </Button>
              <Button variant="primary" size="medium" onClick={onNext}>
                결과 해석하기
              </Button>
            </ButtonGroup>
          </RevealSection>
        )}
      </CardSection>

      {!isRevealing && (
        <Hint 
          onClick={selectedCards.length === 3 ? handleConfirm : undefined}
          isClickable={selectedCards.length === 3}
        >
          <HintText>
            {selectedCards.length < 3 
              ? `💡 카드를 클릭하면 선택됩니다. ${selectedCards.length}/3 선택됨`
              : '🎉 3장이 모두 선택되었습니다! 여기를 클릭하여 카드를 뒤집어주세요.'
            }
          </HintText>
        </Hint>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
`;

const Character = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin-bottom: 40px;
  background: linear-gradient(135deg, 
    var(--color-accent-400) 0%, 
    var(--color-accent-600) 100%
  );
  box-shadow: 0 0 50px var(--color-accent-400);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--color-primary-200);
  font-weight: 700;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
  color: var(--color-primary-300);
  line-height: 1.6;
`;

const CardSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  max-width: 1200px;
  width: 100%;
  max-height: 600px;
  overflow-y: auto;
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  background: var(--color-primary-900);
  opacity: 0.8;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 237, 77, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-accent-400);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-accent-500);
  }
`;

const RevealSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
`;

const RevealTitle = styled.h2`
  font-size: 2rem;
  color: var(--color-text-accent);
  margin: 0;
  font-weight: 600;
`;

const RevealGrid = styled.div`
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  min-height: 350px;
`;

const RevealCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;


const Hint = styled.div<{ isClickable: boolean }>`
  margin-top: 30px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 237, 77, 0.15);
  border: 1px solid var(--color-accent-400);
  transition: all 0.3s ease;
  
  ${props => props.isClickable && `
    cursor: pointer;
    background: rgba(255, 237, 77, 0.25);
    border: 2px solid var(--color-accent-400);
    
    &:hover {
      background: rgba(255, 237, 77, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--color-accent-400);
    }
    
    &:active {
      transform: translateY(0px);
    }
  `}
`;

const HintText = styled.p`
  margin: 0;
  color: var(--color-text-accent);
  line-height: 1.6;
  font-weight: 500;
`;


export default CardDrawPage;