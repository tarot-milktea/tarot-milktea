import Button from '../common/Button/Button';
import ButtonGroup from '../common/Button/ButtonGroup';

interface ResultActionsProps {
  onRestart: () => void;
  onShare: () => void;
  restartText?: string;
  shareText?: string;
}

function ResultActions({
  onRestart,
  onShare,
  restartText = '새로운 타로 보기',
  shareText = '결과 공유하기'
}: ResultActionsProps) {
  return (
    <ButtonGroup gap="large" align="center">
      <Button
        variant="primary"
        size="large"
        onClick={onRestart}
      >
        {restartText}
      </Button>

      <Button
        variant="secondary"
        size="large"
        onClick={onShare}
      >
        {shareText}
      </Button>
    </ButtonGroup>
  );
}

export default ResultActions;