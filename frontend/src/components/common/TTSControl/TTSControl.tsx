import React from 'react';
import styled from '@emotion/styled';
import { useTTSStore } from '../../../store/ttsStore';

interface TTSControlProps {
  className?: string;
}

const TTSControl: React.FC<TTSControlProps> = ({ className }) => {
  const { isMuted, isPlaying, toggleMute } = useTTSStore();

  return (
    <FloatingContainer className={className}>
      <ControlButton
        onClick={toggleMute}
        isMuted={isMuted}
        isPlaying={isPlaying}
        title={isMuted ? 'TTS 음소거 해제' : 'TTS 음소거'}
      >
        {isMuted ? '🔇' : '🔊'}
        {isPlaying && !isMuted && <PlayingIndicator />}
      </ControlButton>
    </FloatingContainer>
  );
};

const FloatingContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ControlButton = styled.button<{ isMuted: boolean; isPlaying: boolean }>`
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: ${props => props.isMuted
    ? 'linear-gradient(135deg, var(--color-error-500) 0%, var(--color-error-400) 100%)'
    : 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-500) 100%)'
  };
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: ${props => props.isMuted
      ? 'linear-gradient(135deg, var(--color-error-400) 0%, var(--color-error-300) 100%)'
      : 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-400) 100%)'
    };
  }

  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-md);
  }
`;

const PlayingIndicator = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 15px;
  height: 15px;
  background: var(--color-accent-400);
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 1.5s ease-in-out infinite alternate;

  @keyframes pulse {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

export default TTSControl;