import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

function ErrorPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <ErrorContainer>

      <ErrorCard
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ErrorIcon
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
        >
          ⭐
        </ErrorIcon>

        <ErrorTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          길을 잃으셨나요?
        </ErrorTitle>

        <ErrorDescription
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          타로의 신비로운 길에서 벗어나셨습니다.<br />
          다시 운명의 카드로 돌아가 보세요.
        </ErrorDescription>

        <BackButton
          onClick={handleGoHome}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          타로 점보러 가기
        </BackButton>
      </ErrorCard>
    </ErrorContainer>
  );
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ErrorCard = styled(motion.div)`
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(10px);
`;

const ErrorIcon = styled(motion.div)`
  font-size: 72px;
  margin-bottom: 30px;
  filter: drop-shadow(0 0 10px var(--color-accent-400));
`;

const ErrorTitle = styled(motion.h1)`
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-accent);
  margin-bottom: 16px;
  text-shadow: 0 0 10px rgba(255, 232, 26, 0.3);
`;

const ErrorDescription = styled(motion.p)`
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
`;

const BackButton = styled(motion.button)`
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);

  &:hover {
    background: var(--color-button-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }
`;


export default ErrorPage;