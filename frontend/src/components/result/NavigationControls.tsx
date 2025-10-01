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
}

function NavigationControls({
  canGoBack,
  canGoNext,
  isLastStep,
  isTTSPlaying,
  onPrevious,
  onNext,
  onSkipTTS
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

export default NavigationControls;