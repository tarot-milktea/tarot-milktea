import styled from '@emotion/styled';
import Button from '../common/Button/Button';

interface NavigationControlsProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isTTSPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkipTTS: () => void;
  autoPlayEnabled: boolean;
  onToggleAutoPlay: () => void;
}

function NavigationControls({
  canGoBack,
  canGoNext,
  isLastStep,
  isTTSPlaying,
  onPrevious,
  onNext,
  onSkipTTS,
  autoPlayEnabled,
  onToggleAutoPlay
}: NavigationControlsProps) {
  return (
    <ControlsContainer>
      <ButtonGroup>
        <Button
          variant="secondary"
          size="medium"
          onClick={onPrevious}
          disabled={!canGoBack}
        >
          ← 이전
        </Button>

        {isTTSPlaying && (
          <Button
            variant="ghost"
            size="medium"
            onClick={onSkipTTS}
          >
            TTS 스킵
          </Button>
        )}

        {!isLastStep && (
          <Button
            variant="primary"
            size="medium"
            onClick={onNext}
            disabled={!canGoNext}
          >
            다음 →
          </Button>
        )}
      </ButtonGroup>

      <SettingsGroup>
        <AutoPlayToggle onClick={onToggleAutoPlay} $isEnabled={autoPlayEnabled}>
          <ToggleIcon>{autoPlayEnabled ? '🔊' : '🔇'}</ToggleIcon>
          <ToggleText>
            {autoPlayEnabled ? '자동 진행' : '수동 진행'}
          </ToggleText>
        </AutoPlayToggle>
      </SettingsGroup>
    </ControlsContainer>
  );
}

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
  padding-top: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const SettingsGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AutoPlayToggle = styled.button<{ $isEnabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$isEnabled
    ? 'var(--color-accent-600)'
    : 'var(--color-primary-700)'
  };
  border: 1px solid ${props => props.$isEnabled
    ? 'var(--color-accent-400)'
    : 'var(--color-primary-500)'
  };
  border-radius: 20px;
  padding: 8px 16px;
  color: ${props => props.$isEnabled
    ? 'var(--color-primary-900)'
    : 'var(--color-primary-200)'
  };
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$isEnabled
      ? 'var(--color-accent-500)'
      : 'var(--color-primary-600)'
    };
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ToggleIcon = styled.span`
  font-size: 1rem;
`;

const ToggleText = styled.span`
  font-size: 0.875rem;
`;

export default NavigationControls;