import Button from '../common/Button/Button';
import ButtonGroup from '../common/Button/ButtonGroup';

interface ResultActionsProps {
  onRestart: () => void;
  onShare: () => void;
  onDownloadImage?: () => void;
  restartText?: string;
  shareText?: string;
  downloadText?: string;
}

function ResultActions({
  onRestart,
  onShare,
  onDownloadImage,
  restartText = '새로운 타로 보기',
  shareText = '결과 공유하기',
  downloadText = '이미지 다운로드'
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

      {onDownloadImage && (
        <Button
          variant="secondary"
          size="large"
          onClick={onDownloadImage}
        >
          {downloadText}
        </Button>
      )}
    </ButtonGroup>
  );
}

export default ResultActions;