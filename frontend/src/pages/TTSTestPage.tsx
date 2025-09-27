import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTTS } from "../hooks/useTTS";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
  color: white;
`;

const TestSection = styled.div`
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  background: linear-gradient(135deg, #ff6b35, #ff8e53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const VoiceSelector = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  option {
    background: #1a1a2e;
    color: white;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const StatusSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #ff6b35;
`;

const StatusText = styled.div`
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;

  &::after {
    content: "";
    display: block;
    width: ${(props) => props.progress}%;
    height: 100%;
    background: linear-gradient(90deg, #ff6b35, #ff8e53);
    transition: width 0.3s ease;
  }
`;

const ErrorText = styled.div`
  color: #ff4757;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 4px;
`;

const StyledButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  min-width: 120px;
  padding: 12px 24px;
  border: 2px solid
    ${(props) =>
      props.$primary
        ? "#ff6b35"
        : props.$danger
        ? "#ff4757"
        : "rgba(255, 255, 255, 0.2)"};
  border-radius: 8px;
  background: ${(props) =>
    props.$primary
      ? "#ff6b35"
      : props.$danger
      ? "#ff4757"
      : "rgba(255, 255, 255, 0.05)"};
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$primary
        ? "#ff8e53"
        : props.$danger
        ? "#ff6b7a"
        : "rgba(255, 255, 255, 0.1)"};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const voices = [
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "nova", label: "Nova" },
  { value: "shimmer", label: "Shimmer" },
];

const TTSTestPage: React.FC = () => {
  const [text, setText] = useState("안녕하세요! TTS 테스트입니다.");
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [instructions, setInstructions] = useState("");

  const {
    status,
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
    canPlay,
  } = useTTS({
    autoPlay: true, // 자동 재생 모드
  });

  const handleSpeak = async () => {
    if (!text.trim()) return;
    await requestTTSStream(text, selectedVoice, instructions.trim() || undefined);
  };

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "#ffa502";
      case "playing":
        return "#2ed573";
      case "error":
        return "#ff4757";
      default:
        return "#70a1ff";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "loading":
        return "음성 생성 중...";
      case "playing":
        return "재생 중";
      case "error":
        return "오류 발생";
      case "paused":
        return "일시정지";
      default:
        return hasAudioData ? "재생 준비됨" : "대기 중";
    }
  };

  return (
    <Container>
      <TestSection>
        <Title>TTS 테스트</Title>

        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="변환할 텍스트를 입력하세요... (SSE 스트리밍 모드)"
          disabled={isLoading}
        />

        <VoiceSelector
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          disabled={isLoading}
        >
          {voices.map((voice) => (
            <option key={voice.value} value={voice.value}>
              {voice.label}
            </option>
          ))}
        </VoiceSelector>

        <TextArea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="음성 지시사항을 입력하세요... (선택사항)"
          disabled={isLoading}
          style={{
            minHeight: "60px",
            fontSize: "0.9rem",
            opacity: 0.8
          }}
        />

        <ControlsRow>
          <StyledButton
            onClick={handleSpeak}
            disabled={isLoading || !text.trim()}
            $primary
          >
            {isLoading ? "처리 중..." : "TTS 요청"}
          </StyledButton>

          {canPlay && (
            <StyledButton
              onClick={playAudio}
              style={{
                background: "linear-gradient(135deg, #2ed573, #7bed9f)",
                borderColor: "#2ed573",
              }}
            >
              🎵 재생
            </StyledButton>
          )}

          {isPlaying && (
            <StyledButton onClick={stopAudio} $danger>
              ⏹️ 정지
            </StyledButton>
          )}

          {(hasAudio || hasError) && (
            <StyledButton onClick={reset}>🔄 초기화</StyledButton>
          )}
        </ControlsRow>

        <StatusSection>
          <StatusText style={{ color: getStatusColor() }}>
            상태: {getStatusText()}
          </StatusText>

          {progress > 0 && (
            <>
              <div>진행률: {Math.round(progress)}%</div>
              <ProgressBar progress={progress} />
            </>
          )}

          <div
            style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.5rem" }}
          >
            음성: {selectedVoice}
            <br />
            모델: gpt-4o-mini-tts
            <br />
            hasAudioData: {hasAudioData ? "✅" : "❌"}
            <br />
            canPlay: {canPlay ? "✅" : "❌"}
            <br />
            <span style={{ fontSize: "0.8rem", color: "#ffa502" }}>
              💡 서버에서 SSE로 응답을 처리합니다
            </span>
          </div>

          {hasError && error && <ErrorText>오류: {error}</ErrorText>}
        </StatusSection>
      </TestSection>
    </Container>
  );
};

export default TTSTestPage;
