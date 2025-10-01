import styled from '@emotion/styled';

interface InnerHeaderProps {
  nickname?: string;
  questionText?: string;
}

function InnerHeader({ nickname, questionText }: InnerHeaderProps) {
  return (
    <HeaderContainer>
      <Title>
        {nickname ? `${nickname}님의 타로 해석 결과` : '타로 해석 결과'}
      </Title>
      {questionText && (
        <Question>
          질문: {questionText}
        </Question>
      )}
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-primary-600);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Question = styled.p`
  font-size: 0.95rem;
  color: var(--color-primary-300);
  margin: 0;
  line-height: 1.4;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

export default InnerHeader;