import styled from '@emotion/styled';

interface SummarySectionProps {
  summary?: string;
  fortuneScore?: number | null;
}

function SummarySection({ summary, fortuneScore }: SummarySectionProps) {
  return (
    <SummaryContainer>
      <SummaryHeader>
        <SummaryTitle>📋 종합 해석</SummaryTitle>
        {fortuneScore !== null && fortuneScore !== undefined && (
          <ScoreDisplay>
            <ScoreNumber>{fortuneScore}</ScoreNumber>
            <ScoreLabel>/100</ScoreLabel>
          </ScoreDisplay>
        )}
      </SummaryHeader>

      <SummaryText>
        {summary || '종합 해석을 생성하는 중...'}
      </SummaryText>
    </SummaryContainer>
  );
}

const SummaryContainer = styled.div`
  background: var(--color-primary-900);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  background: var(--color-primary-800);
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid var(--color-accent-400);
`;

const ScoreNumber = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent-300);
`;

const ScoreLabel = styled.span`
  font-size: 1rem;
  color: var(--color-primary-300);
`;

const SummaryText = styled.div`
  color: var(--color-primary-200);
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
`;

export default SummarySection;