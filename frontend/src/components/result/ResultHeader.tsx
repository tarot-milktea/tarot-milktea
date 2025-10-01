import styled from '@emotion/styled';

interface ResultHeaderProps {
  title?: string;
  subtitle?: string;
  nickname?: string;
  error?: string | null | undefined;
}

function ResultHeader({
  title = '🔮 타로 해석 결과',
  subtitle = 'AI가 실시간으로 생성하는 맞춤형 타로 해석',
  nickname,
  error
}: ResultHeaderProps) {
  const getMysticalSubtitle = (nickname?: string) => {
    if (!nickname) return subtitle;

    const mysticalMessages = [
      `${nickname}님의 운명이 별빛 속에서 속삭입니다`,
      `시공간을 넘나드는 ${nickname}님만의 신비로운 이야기`,
      `우주가 ${nickname}님에게 전하는 깊은 메시지`,
      `${nickname}님의 영혼이 선택한 신성한 길잡이`,
      `달빛이 비추는 ${nickname}님의 운명적 순간들`
    ];

    return mysticalMessages[Math.floor(Math.random() * mysticalMessages.length)];
  };

  return (
    <>
      <Header>
        <Title>{title}</Title>
        <Subtitle>{getMysticalSubtitle(nickname)}</Subtitle>
      </Header>

      {/* 오류 표시 */}
      {error && (
        <ErrorStatus>
          <StatusMessage variant="error">
            <StatusIcon>❌</StatusIcon>
            {error}
          </StatusMessage>
        </ErrorStatus>
      )}
    </>
  );
}

const Header = styled.div`
  text-align: center;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary-200);
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--color-primary-400);
  margin: 0;
  line-height: 1.4;
`;

const ErrorStatus = styled.div`
  margin-bottom: 16px;
`;

const StatusMessage = styled.div<{ variant: 'error' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--color-error-900);
  border: 1px solid var(--color-error-600);
  color: var(--color-error-200);
`;

const StatusIcon = styled.span`
  font-size: 1.1rem;
  flex-shrink: 0;
`;

export default ResultHeader;