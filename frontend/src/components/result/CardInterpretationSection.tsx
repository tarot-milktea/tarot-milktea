import styled from '@emotion/styled';
import CardVideo from '../TarotCard/CardVideo';
import type { PredefinedCard } from '../../store/sessionStore';

interface CardInterpretationSectionProps {
  title: string;
  icon: string;
  card?: PredefinedCard;
  interpretation?: string;
  videoSize?: 'small' | 'large';
}

function CardInterpretationSection({
  title,
  icon,
  card,
  interpretation,
  videoSize = 'small'
}: CardInterpretationSectionProps) {
  const defaultText = `${title.includes('과거') ? '과거' : title.includes('현재') ? '현재' : '미래'} 해석을 불러오는 중...`;

  return (
    <CardSection>
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
              cardName={card.nameKo}
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

      <CardContent>
        {interpretation || defaultText}
      </CardContent>
    </CardSection>
  );
}

const CardSection = styled.div`
  background: var(--color-primary-800);
  border: 1px solid var(--color-primary-600);
  border-radius: 12px;
  padding: 20px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    min-height: 450px;
  }
`;

const CardVideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 auto 16px auto;

  /* 타로 카드 비율: 대략 7:12 */
  width: 140px;

  .card-video-wrapper {
    width: 140px;
    height: 240px;
    border-radius: 8px;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    width: 120px;

    .card-video-wrapper {
      width: 120px;
      height: 200px;
    }
  }
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const CardName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-200);
  margin: 0;
`;

const OrientationBadge = styled.div<{ isReversed: boolean }>`
  background: ${props => props.isReversed ? 'var(--color-warning-400)' : 'var(--color-success-400)'};
  color: var(--color-primary-900);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid ${props => props.isReversed ? 'var(--color-warning-600)' : 'var(--color-success-600)'};
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-accent-300);
  margin: 0 0 16px 0;
  text-align: center;
`;

const CardContent = styled.div`
  color: var(--color-primary-200);
  line-height: 1.6;
  font-size: 0.95rem;
`;

export default CardInterpretationSection;