import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  padding: 20px 0;
  position: relative;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

export const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const LoadingContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const LoadingText = styled.p`
  color: var(--color-primary-300);
  font-size: 1.2rem;
`;

export const ErrorContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

export const ErrorText = styled.p`
  color: var(--color-primary-300);
  font-size: 1.2rem;
  margin: 0;
`;