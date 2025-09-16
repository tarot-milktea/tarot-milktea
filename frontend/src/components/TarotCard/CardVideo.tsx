import React, { useState } from 'react';
import styled from '@emotion/styled';

interface CardVideoProps {
  cardId: number;
  isReversed?: boolean;
  size?: 'small' | 'large';
  autoPlay?: boolean;
  context?: 'tarot-card' | 'result-page'; // 어디서 사용되는지 구분
  videoUrl?: string; // 백엔드에서 받은 비디오 URL
  cardName?: string; // 백엔드에서 받은 카드 이름
}

// 카드 ID에 따른 비디오 매핑
const getVideoByCardId = (cardId: number): string => {
  const videoMap: Record<number, string> = {
    1: '/src/assets/ExampleCardVideo/fool.mov',
    2: '/src/assets/ExampleCardVideo/magician.mov',
    3: '/src/assets/ExampleCardVideo/wands.mov'
  };
  
  // 카드 ID를 3으로 나눈 나머지로 순환 매핑
  const mappedId = ((cardId - 1) % 3) + 1;
  return videoMap[mappedId] || videoMap[1];
};

// 카드 이름 매핑
const getCardNameByVideoId = (videoId: number): string => {
  const nameMap: Record<number, string> = {
    1: 'The Fool',
    2: 'The Magician', 
    3: 'Ace of Wands'
  };
  return nameMap[videoId] || 'Unknown Card';
};

const CardVideo: React.FC<CardVideoProps> = ({
  cardId,
  isReversed = false,
  size = 'large',
  autoPlay = true,
  context = 'tarot-card',
  videoUrl,
  cardName: propCardName
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 백엔드 videoUrl이 있으면 사용, 없으면 로컬 비디오 사용 (기존 로직)
  const videoSrc = videoUrl || getVideoByCardId(cardId);
  const mappedId = ((cardId - 1) % 3) + 1;
  const cardName = propCardName || getCardNameByVideoId(mappedId);

  // 디버깅: 비디오 소스 확인
  console.log(`🎥 Card ${cardId} video:`, {
    videoUrl,
    videoSrc,
    cardName: propCardName,
    usingBackend: !!videoUrl
  });

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
        aria-label={`${cardName} 타로 카드 영상`}
      />
      
      {isLoaded && (
        <CardNameLabel size={size}>
          {cardName}
        </CardNameLabel>
      )}
    </VideoContainer>
  );
};

const VideoContainer = styled.div<{ 
  size: 'small' | 'large'; 
  isReversed: boolean; 
  context: 'tarot-card' | 'result-page';
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
  ${props => props.context === 'result-page' && props.isReversed && `
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
  opacity: ${props => props.isLoaded ? 1 : 0};
  
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

const CardNameLabel = styled.div<{ size: 'small' | 'large' }>`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: var(--color-accent-400);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: ${props => props.size === 'large' ? '0.75rem' : '0.625rem'};
  font-weight: 600;
  backdrop-filter: blur(4px);
  opacity: 0.9;
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
`;

export default CardVideo;