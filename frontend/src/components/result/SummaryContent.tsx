import styled from '@emotion/styled';
import TypingText from '../common/TypingText/TypingText';
import { resultUtilService } from '../../services/resultService';

interface SummaryContentProps {
  summary?: string;
  fortuneScore?: number | null;
}

function SummaryContent({ summary, fortuneScore }: SummaryContentProps) {
  const fortuneMessage = fortuneScore !== null && fortuneScore !== undefined
    ? resultUtilService.getFortuneMessage(fortuneScore)
    : null;

  return (
    <ContentContainer>
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
        <TypingText
          text={summary || '종합 해석을 생성하는 중...'}
          typingSpeed={30}
          delay={500}
          showCursor={true}
        />
      </SummaryText>
    </ContentContainer>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  align-items: center;
  text-align: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
`;

const SummaryHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 24px;
  }
`;

const SummaryTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent-300);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ScoreCapsule = styled.div`
  background: var(--color-primary-700);
  border: 2px solid var(--color-accent-400);
  border-radius: 30px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  height: fit-content;
`;

const ScoreText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
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

const FortuneMessage = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-accent-200);
  word-break: keep-all;

  &::before {
    content: "•";
    color: var(--color-primary-400);
    margin-right: 8px;
  }
`;

const SummaryText = styled.div`
  color: var(--color-primary-200);
  line-height: 1.7;
  font-size: 1.1rem;
  white-space: pre-wrap;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export default SummaryContent;