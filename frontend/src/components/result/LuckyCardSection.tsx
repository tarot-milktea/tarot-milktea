import styled from '@emotion/styled';

interface LuckyCardSectionProps {
  luckyCard?: {
    name: string;
    message: string;
    imageUrl: string;
  };
  title?: string;
}

function LuckyCardSection({
  luckyCard,
  title = '🍀 행운 카드'
}: LuckyCardSectionProps) {
  if (!luckyCard) {
    return null;
  }

  return (
    <LuckyCardContainer>
      <SectionTitle>{title}</SectionTitle>
      <CardContent>
        <CardImage
          src={luckyCard.imageUrl}
          alt={`${luckyCard.name} 행운 카드`}
        />
        <CardInfo>
          <CardName>{luckyCard.name}</CardName>
          <CardMessage>{luckyCard.message}</CardMessage>
        </CardInfo>
      </CardContent>
    </LuckyCardContainer>
  );
}

const LuckyCardContainer = styled.div`
  background: var(--color-primary-800);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: center;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0 0 16px 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    gap: 24px;
  }
`;

const CardImage = styled.img`
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const CardName = styled.h4`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent-300);
  margin: 0;
`;

const CardMessage = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-primary-200);
  margin: 0;
  white-space: pre-wrap;
`;

export default LuckyCardSection;