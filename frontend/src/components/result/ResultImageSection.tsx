import styled from '@emotion/styled';

interface ResultImageSectionProps {
  imageUrl?: string;
  imageDescription?: string;
  title?: string;
}

function ResultImageSection({
  imageUrl,
  imageDescription,
  title = '🎨 맞춤 조언 이미지'
}: ResultImageSectionProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <ImageContainer>
      <ImageTitle>{title}</ImageTitle>
      <ResultImage
        src={imageUrl}
        alt={imageDescription || '타로 조언 이미지'}
      />
    </ImageContainer>
  );
}

const ImageContainer = styled.div`
  background: var(--color-primary-800);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: center;
`;

const ImageTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0 0 16px 0;
`;

const ResultImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
`;

export default ResultImageSection;