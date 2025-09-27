import { useParams, useNavigate } from 'react-router-dom';
import { useShareData, type DrawnCard } from '../hooks/useShareData';
import Button from '../components/common/Button/Button';
import ResultHeader from '../components/result/ResultHeader';
import CardInterpretationSection from '../components/result/CardInterpretationSection';
import SummarySection from '../components/result/SummarySection';
import LuckyCardSection from '../components/result/LuckyCardSection';
import ShareResultActions from '../components/result/ShareResultActions';
import {
  Container,
  Content,
  CardsGrid,
  ErrorContainer,
  ErrorText
} from '../components/result/ResultPage.styles';

function SharePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, hasError, error } = useShareData(sessionId);

  // sessionId 유효성 검사
  if (!sessionId?.trim()) {
    return (
      <ErrorContainer>
        <ErrorText>유효하지 않은 공유 링크입니다.</ErrorText>
        <Button
          variant="primary"
          size="large"
          onClick={() => navigate('/')}
        >
          새로운 타로 보기
        </Button>
      </ErrorContainer>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <Container>
        <Content>
          <ErrorContainer>
            <ErrorText>결과를 불러오는 중...</ErrorText>
          </ErrorContainer>
        </Content>
      </Container>
    );
  }

  // 에러 상태
  if (hasError || !data) {
    return (
      <Container>
        <Content>
          <ErrorContainer>
            <ErrorText>
              {error || '결과를 불러올 수 없습니다.'}
            </ErrorText>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/')}
            >
              새로운 타로 보기
            </Button>
          </ErrorContainer>
        </Content>
      </Container>
    );
  }

  // 카드 데이터를 position 순서로 정렬
  const sortedCards = [...data.drawnCards].sort((a, b) => a.position - b.position);

  // 카드를 과거, 현재, 미래 순서로 매핑
  const pastCard = sortedCards[0];
  const presentCard = sortedCards[1];
  const futureCard = sortedCards[2];

  // DrawnCard를 PredefinedCard 형식으로 변환하는 함수
  const convertToCardFormat = (drawnCard: DrawnCard) => ({
    position: drawnCard.position,
    cardId: drawnCard.cardId,
    nameKo: drawnCard.nameKo,
    nameEn: drawnCard.nameEn,
    orientation: drawnCard.orientation,
    videoUrl: drawnCard.videoUrl
  });

  return (
    <Container>
      <Content>
        {/* 헤더 */}
        <ResultHeader nickname={data.nickname} />

        {/* 카드 해석 - 가로 배치 */}
        <CardsGrid>
          <CardInterpretationSection
            title="과거"
            icon="🕰️"
            card={pastCard ? convertToCardFormat(pastCard) : undefined}
            interpretation={data.interpretations.past}
            videoSize="large"
          />

          <CardInterpretationSection
            title="현재"
            icon="⭐"
            card={presentCard ? convertToCardFormat(presentCard) : undefined}
            interpretation={data.interpretations.present}
            videoSize="small"
          />

          <CardInterpretationSection
            title="미래"
            icon="🔮"
            card={futureCard ? convertToCardFormat(futureCard) : undefined}
            interpretation={data.interpretations.future}
            videoSize="small"
          />
        </CardsGrid>

        {/* 종합 해석 및 점수 */}
        <SummarySection
          summary={data.interpretations.summary}
          fortuneScore={data.fortuneScore}
        />

        {/* 행운 카드 */}
        <LuckyCardSection luckyCard={data.luckyCard} />

        {/* 액션 버튼 (새로운 타로 보기만) */}
        <ShareResultActions />
      </Content>
    </Container>
  );
}

export default SharePage;