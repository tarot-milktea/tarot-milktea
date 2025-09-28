import styled from '@emotion/styled';
import TypingText from '../common/TypingText/TypingText';
import FlippableLuckyCard from './FlippableLuckyCard';

interface LuckyContentProps {
  luckyCard?: {
    name: string;
    message: string;
    imageUrl: string;
  };
  title?: string;
}

function LuckyContent({
  luckyCard,
  title = '🍀 행운 카드'
}: LuckyContentProps) {
  return (
    <ContentContainer>
      <SectionTitle>{title}</SectionTitle>
      <CardContainer>
        <FlippableLuckyCard luckyCard={luckyCard} />
      </CardContainer>
      {luckyCard && (
        <CardInfo>
          <CardName>{luckyCard.name}</CardName>
          <CardMessage>
            <TypingText
              text={luckyCard.message}
              typingSpeed={30}
              delay={500}
              showCursor={true}
            />
          </CardMessage>
        </CardInfo>
      )}
    </ContentContainer>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  align-items: center;
  text-align: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent-300);
  margin: 0;
  text-shadow: 0 0 15px var(--color-accent-400);

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

const CardName = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-accent-300);
  margin: 0;
  text-shadow: 0 0 10px var(--color-accent-400);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardMessage = styled.p`
  font-size: 1.2rem;
  line-height: 1.7;
  color: var(--color-primary-200);
  margin: 0;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export default LuckyContent;