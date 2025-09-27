import styled from '@emotion/styled';
import CardVideo from '../TarotCard/CardVideo';
import type { PredefinedCard } from '../../store/sessionStore';

interface CardContentProps {
  title: string;
  icon: string;
  card?: PredefinedCard;
  interpretation?: string;
  videoSize?: 'small' | 'large';
}

function CardContent({
  title,
  icon,
  card,
  interpretation,
  videoSize = 'large'
}: CardContentProps) {
  const defaultText = `${title.includes('과거') ? '과거' : title.includes('현재') ? '현재' : '미래'} 해석을 불러오는 중...`;

  return (
    <ContentContainer>
      <CardTitle>{icon} {title}</CardTitle>

      {card && (
        <CardVideoContainer>
          <div className="card-video-wrapper">
            <CardVideo
              cardId={card.cardId}
              isReversed={card.orientation === 'reversed'}
              size={videoSize}
              autoPlay={true}
              context="result-page"
              videoUrl={card.videoUrl}
            />
          </div>
          <CardInfo>
            <CardName>{card.nameKo}</CardName>
            <OrientationBadge isReversed={card.orientation === 'reversed'}>
              {card.orientation === 'upright' ? '정방향' : '역방향'}
            </OrientationBadge>
          </CardInfo>
        </CardVideoContainer>
      )}

      <CardInterpretation>
        {interpretation || defaultText}
      </CardInterpretation>
    </ContentContainer>
  );
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  align-items: center;
  text-align: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
`;

const CardTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent-300);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const CardVideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  /* 타로 카드 비율: 대략 7:12 */
  width: 200px;

  .card-video-wrapper {
    width: 200px;
    height: 340px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 768px) {
    width: 160px;

    .card-video-wrapper {
      width: 160px;
      height: 280px;
    }
  }
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const CardName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary-200);
  margin: 0;
`;

const OrientationBadge = styled.div<{ isReversed: boolean }>`
  background: ${props => props.isReversed ? 'var(--color-warning-400)' : 'var(--color-success-400)'};
  color: var(--color-primary-900);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${props => props.isReversed ? 'var(--color-warning-600)' : 'var(--color-success-600)'};
`;

const CardInterpretation = styled.div`
  color: var(--color-primary-200);
  line-height: 1.7;
  font-size: 1.1rem;
  max-width: 600px;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export default CardContent;