import React, { useState } from "react";
import styled from "@emotion/styled";

interface CardVideoProps {
  cardId: number;
  isReversed?: boolean;
  size?: "small" | "large";
  autoPlay?: boolean;
  context?: "tarot-card" | "result-page"; // 어디서 사용되는지 구분
  videoUrl?: string; // 백엔드에서 받은 비디오 URL
}

const CardVideo: React.FC<CardVideoProps> = ({
  cardId,
  isReversed = false,
  size = "large",
  autoPlay = true,
  context = "tarot-card",
  videoUrl,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 백엔드에서 받은 videoUrl 사용
  const videoSrc = videoUrl;

  // videoUrl이 없으면 에러 상태로 처리
  if (!videoUrl) {
    console.warn(`⚠️ Card ${cardId}: No videoUrl provided from backend`);
    setHasError(true);
  }

  const handleVideoLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (hasError) {
    return (
      <VideoContainer size={size} isReversed={isReversed} context={context}>
        <ErrorPlaceholder>
          <ErrorIcon>🎴</ErrorIcon>
          <ErrorText>카드 영상을 불러올 수 없습니다</ErrorText>
        </ErrorPlaceholder>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer size={size} isReversed={isReversed} context={context}>
      {!isLoaded && (
        <LoadingPlaceholder>
          <LoadingSpinner />
          <LoadingText>카드 영상 로딩 중...</LoadingText>
        </LoadingPlaceholder>
      )}

      <StyledVideo
        src={videoSrc}
        autoPlay={autoPlay}
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        isLoaded={isLoaded}
        aria-label={`카드 ${cardId} 타로 카드 영상`}
      />

    </VideoContainer>
  );
};

const VideoContainer = styled.div<{
  size: "small" | "large";
  isReversed: boolean;
  context: "tarot-card" | "result-page";
}>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-card-front-bg);
  display: flex;
  align-items: center;
  justify-content: center;

  /* 역방향 회전: ResultPage에서는 직접 처리, TarotCard에서는 CardInner가 처리 */
  ${(props) =>
    props.context === "result-page" &&
    props.isReversed &&
    `
    transform: rotateZ(180deg);
  `}
`;

const StyledVideo = styled.video<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: opacity 0.5s ease;

  /* 로딩 중에는 숨김 */
  opacity: ${(props) => (props.isLoaded ? 1 : 0)};

  /* 비디오 컨트롤 완전히 숨김 */
  &::-webkit-media-controls {
    display: none !important;
  }

  &::-webkit-media-controls-panel {
    display: none !important;
  }

  &::-webkit-media-controls-play-button {
    display: none !important;
  }

  &::-webkit-media-controls-start-playback-button {
    display: none !important;
  }
`;

const LoadingPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-card-front-bg);
  color: var(--color-card-placeholder-text);
  z-index: 1;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-primary-700);
  border-top: 3px solid var(--color-accent-400);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 0.75rem;
  color: var(--color-card-placeholder-text);
  text-align: center;
`;

const ErrorPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-card-placeholder-text);
  text-align: center;
  padding: 16px;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.6;
`;

const ErrorText = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
`;


export default CardVideo;
