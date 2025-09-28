import styled from '@emotion/styled';
import { type ReactNode } from 'react';

interface StepContainerProps {
  children: ReactNode;
  className?: string;
}

function StepContainer({ children, className }: StepContainerProps) {
  return (
    <Container className={className}>
      {children}
    </Container>
  );
}

const Container = styled.div`
  background: var(--color-primary-800);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 24px;
  min-height: calc(100vh - 120px); /* ProgressBar, ResultHeader 공간 확보 */
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  /* 내부 요소들이 전체 너비를 사용하도록 강제 */
  > * {
    width: 100%;
  }

  @media (max-width: 768px) {
    padding: 20px;
    min-height: calc(100vh - 100px);
    max-width: calc(100% - 40px);
    margin: 20px;
    gap: 16px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    margin: 10px;
    max-width: calc(100% - 20px);
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

export default StepContainer;