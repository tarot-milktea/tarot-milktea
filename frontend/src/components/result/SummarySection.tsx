import styled from '@emotion/styled';
import { resultUtilService } from '../../services/resultService';

interface SummarySectionProps {
  summary?: string;
  fortuneScore?: number | null;
}

function SummarySection({ summary, fortuneScore }: SummarySectionProps) {
  const fortuneMessage = fortuneScore !== null && fortuneScore !== undefined
    ? resultUtilService.getFortuneMessage(fortuneScore)
    : null;

  return (
    <SummaryContainer>
      <SummaryHeader>
        <SummaryTitle>📋 종합 해석</SummaryTitle>
        {fortuneScore !== null && fortuneScore !== undefined && (
          <ScoreCapsule>
            <ScoreText>
              <ScoreNumber>{fortuneScore}</ScoreNumber>
              <ScoreLabel>/100</ScoreLabel>
            </ScoreText>
            {fortuneMessage && (
              <FortuneMessage>{fortuneMessage}</FortuneMessage>
            )}
          </ScoreCapsule>
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

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0;
`;

const ScoreCapsule = styled.div`
  background: var(--color-primary-800);
  border: 2px solid var(--color-accent-400);
  border-radius: 24px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: fit-content;
`;

const ScoreText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
`;

const ScoreNumber = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent-300);
`;

const ScoreLabel = styled.span`
  font-size: 0.8rem;
  color: var(--color-primary-300);
`;

const FortuneMessage = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-accent-200);
  word-break: keep-all;

  &::before {
    content: "•";
    color: var(--color-primary-400);
    margin-right: 6px;
  }
`;

const SummaryText = styled.div`
  color: var(--color-primary-200);
  line-height: 1.7;
  font-size: 1rem;
  white-space: pre-wrap;
`;

export default SummarySection;