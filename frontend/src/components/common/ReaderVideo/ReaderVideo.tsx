import React, { useState } from "react";
import styled from "@emotion/styled";

interface ReaderVideoProps {
  videoUrl: string;
  readerName: string;
  readerType: string;
  autoPlay?: boolean;
  isPlaying?: boolean;
  size?: "small" | "medium" | "large";
  shape?: "rectangle" | "circle";
  showFallback?: boolean;
  fallbackImageUrl?: string;
}

const ReaderVideo: React.FC<ReaderVideoProps> = ({
  videoUrl,
  readerName,
  readerType,
  autoPlay = true,
  isPlaying = false,
  size = "medium",
  shape = "rectangle",
  showFallback = true,
  fallbackImageUrl,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleVideoLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (hasError && showFallback && fallbackImageUrl) {
    return (
      <VideoContainer size={size} shape={shape} isPlaying={isPlaying}>
        <FallbackImage
          src={fallbackImageUrl}
          alt={readerName}
          onError={() => console.warn(`⚠️ Reader ${readerType}: Fallback image also failed`)}
        />
      </VideoContainer>
    );
  }

  if (hasError) {
    return (
      <VideoContainer size={size} shape={shape} isPlaying={isPlaying}>
        <ErrorPlaceholder>
          <ErrorIcon>🎭</ErrorIcon>
          <ErrorText>{readerName}</ErrorText>
        </ErrorPlaceholder>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer size={size} shape={shape} isPlaying={isPlaying}>
      {!isLoaded && (
        <LoadingPlaceholder>
          <LoadingSpinner />
          <LoadingText>리더 영상 로딩 중...</LoadingText>
        </LoadingPlaceholder>
      )}

      <StyledVideo
        src={videoUrl}
        autoPlay={autoPlay}
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedData={handleVideoLoad}
        onLoadedMetadata={handleVideoLoad}
        onCanPlay={handleVideoLoad}
        onCanPlayThrough={handleVideoLoad}
        onError={handleVideoError}
        isLoaded={isLoaded}
        aria-label={`${readerName} 리더 영상`}
      />
    </VideoContainer>
  );
};

const VideoContainer = styled.div<{
  size: "small" | "medium" | "large";
  shape: "rectangle" | "circle";
  isPlaying: boolean;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-700);

  border-radius: ${(props) =>
    props.shape === "circle" ? "50%" : "16px"};

  ${(props) =>
    props.isPlaying &&
    `
    box-shadow: 0 0 20px var(--color-accent-400);
    transform: scale(1.02);
  `}

  transition: all 0.3s ease;
`;

const StyledVideo = styled.video<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;

  opacity: ${(props) => (props.isLoaded ? 1 : 0)};

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
  background: var(--color-primary-700);
  color: var(--color-primary-300);
  z-index: 1;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-primary-600);
  border-top: 2px solid var(--color-accent-400);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;

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
  color: var(--color-primary-300);
  text-align: center;
`;

const ErrorPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-300);
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

const FallbackImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
`;

export default ReaderVideo;