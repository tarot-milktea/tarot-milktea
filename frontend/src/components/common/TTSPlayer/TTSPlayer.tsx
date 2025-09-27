import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useTTS } from '../../../hooks/useTTS';

interface TTSPlayerProps {
  className?: string;
  defaultText?: string;
  showTextInput?: boolean;
  autoPlay?: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const TTSPlayer: React.FC<TTSPlayerProps> = ({
  className,
  defaultText = '',
  showTextInput = true,
  autoPlay = true,
  onComplete,
  onError
}) => {
  const [text, setText] = useState(defaultText);
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');

  const {
    error,
    progress,
    isPlaying,
    hasAudioData,
    requestTTSStream,
    playAudio,
    stopAudio,
    reset,
    isLoading,
    hasError,
    hasAudio,
    canPlay
  } = useTTS({
    onComplete,
    onError,
    autoPlay
  });

  const handleTTSRequest = async () => {
    if (!text.trim()) {
      return;
    }

    await requestTTSStream(text, selectedVoice);
  };

  const voices = [
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' }
  ];

  return (
    <Container className={className}>
      <Title>TTS Player</Title>

      {showTextInput && (
        <InputSection>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="읽고 싶은 텍스트를 입력하세요... (최대 2000자)"
            maxLength={2000}
            rows={4}
          />
          <CharCount>{text.length}/2000</CharCount>
        </InputSection>
      )}

      <ControlSection>
        <VoiceSelect
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          disabled={isLoading}
        >
          {voices.map(voice => (
            <option key={voice.value} value={voice.value}>
              {voice.label}
            </option>
          ))}
        </VoiceSelect>

        <ButtonGroup>
          <ActionButton
            onClick={handleTTSRequest}
            disabled={!text.trim() || isLoading}
            $primary
          >
            {isLoading ? 'TTS 처리 중...' : 'TTS 요청'}
          </ActionButton>

          {canPlay && (
            <ActionButton
              onClick={playAudio}
              disabled={false}
              style={{ backgroundColor: '#28a745' }}
            >
              🎵 재생
            </ActionButton>
          )}

          {isPlaying && (
            <ActionButton
              onClick={stopAudio}
              disabled={false}
              style={{ backgroundColor: '#dc3545' }}
            >
              ⏹️ 정지
            </ActionButton>
          )}

          {(isLoading || hasError || hasAudio) && (
            <ActionButton
              onClick={reset}
              disabled={false}
            >
              🔄 초기화
            </ActionButton>
          )}
        </ButtonGroup>
      </ControlSection>

      {isLoading && (
        <StatusSection>
          <StatusText>
            TTS 요청을 처리하고 있습니다...
          </StatusText>

          <ProgressContainer>
            <ProgressBar $progress={progress} />
            <ProgressText>{Math.round(progress)}%</ProgressText>
          </ProgressContainer>
        </StatusSection>
      )}

      {hasError && error && (
        <ErrorSection>
          <ErrorText>오류: {error}</ErrorText>
          <RetryButton onClick={handleTTSRequest}>다시 시도</RetryButton>
        </ErrorSection>
      )}

      <InfoSection>
        <InfoText>
          💡 <strong>TTS:</strong> 서버에서 SSE 스트림으로 텍스트를 음성으로 처리합니다
        </InfoText>
      </InfoSection>
    </Container>
  );
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const ControlSection = styled.div`
  margin-bottom: 24px;
`;

const VoiceSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  background-color: ${props => props.$primary ? '#007bff' : '#6c757d'};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${props => props.$primary ? '#0056b3' : '#545b62'};
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const StatusText = styled.div`
  font-size: 14px;
  color: #495057;
  margin-bottom: 12px;
`;

const ProgressContainer = styled.div`
  position: relative;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 10px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const ErrorSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
`;

const ErrorText = styled.div`
  color: #721c24;
  font-size: 14px;
  margin-bottom: 12px;
`;

const RetryButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #dc3545;
  background: white;
  color: #dc3545;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #dc3545;
    color: white;
  }
`;

const InfoSection = styled.div`
  padding: 16px;
  background-color: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
`;

const InfoText = styled.div`
  font-size: 13px;
  color: #0d47a1;
  line-height: 1.6;
`;

export default TTSPlayer;