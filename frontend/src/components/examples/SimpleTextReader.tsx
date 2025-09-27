import React from 'react';
import styled from '@emotion/styled';
import { useTTS } from '../../hooks/useTTS';

interface SimpleTextReaderProps {
  text: string;
  voice?: string;
  className?: string;
}

const SimpleTextReader: React.FC<SimpleTextReaderProps> = ({
  text,
  voice = 'nova',
  className
}) => {
  const { requestTTSStream, isLoading, isPlaying, stopAudio } = useTTS({
    autoPlay: true,
  });

  const handleRead = async () => {
    await requestTTSStream(text, voice);
  };

  return (
    <Container className={className}>
      <Text>{text}</Text>
      <ButtonGroup>
        {!isPlaying ? (
          <PlayButton
            onClick={handleRead}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? '🔄' : '🔊'} {isLoading ? '처리중...' : '읽기'}
          </PlayButton>
        ) : (
          <StopButton onClick={stopAudio}>
            ⏹️ 정지
          </StopButton>
        )}
      </ButtonGroup>
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
`;

const Text = styled.p`
  margin: 0 0 12px 0;
  line-height: 1.5;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const PlayButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const StopButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: #dc3545;
  color: white;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #c82333;
  }
`;

export default SimpleTextReader;

// 사용 예시:
// <SimpleTextReader
//   text="안녕하세요! 이 텍스트를 읽어드립니다."
//   voice="nova"
// />