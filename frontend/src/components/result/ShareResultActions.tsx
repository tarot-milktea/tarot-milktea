import { useNavigate } from 'react-router-dom';
import Button from '../common/Button/Button';
import ButtonGroup from '../common/Button/ButtonGroup';

interface ShareResultActionsProps {
  restartText?: string;
}

function ShareResultActions({
  restartText = '새로운 타로 보기'
}: ShareResultActionsProps) {
  const navigate = useNavigate();

  const handleRestart = () => {
    // 홈 페이지로 이동
    navigate('/');
  };

  return (
    <ButtonGroup gap="large" align="center">
      <Button
        variant="primary"
        size="large"
        onClick={handleRestart}
      >
        {restartText}
      </Button>
    </ButtonGroup>
  );
}

export default ShareResultActions;