import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import { useDataStore } from '../store/dataStore';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';

interface Onboarding5PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding5Page({ onNext, onPrev }: Onboarding5PageProps) {
  const { styles: globalStyles, getColor } = useColors();
  const { readers, isLoading, error } = useDataStore();
  const { selectedReader, setSelectedReader, createSession } = useSessionStore();

  const handleReaderSelect = (reader: any) => {
    // 이미 선택된 리더를 다시 클릭하면 선택 해제 (토글)
    if (selectedReader?.type === reader.type) {
      setSelectedReader(null);
    } else {
      setSelectedReader(reader);
    }
  };

  const handleNext = async () => {
    if (!selectedReader) return;

    try {
      // 리더 선택 완료 후 세션 생성 (미리 정해진 카드들도 함께 가져옴)
      await createSession();
      onNext();
    } catch (error) {
      console.error('Failed to create session:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  return (
    <Container style={globalStyles.container}>
      <Title 
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        타로를 봐줄 캐릭터를 선택하세요
      </Title>
      
      <Description 
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        어떤 스타일의 해석을 받고 싶으신가요?
      </Description>

      {/* 로딩 상태 */}
      {isLoading && (
        <LoadingText style={{ color: getColor('primary', '300') }}>
          리더 정보를 불러오는 중...
        </LoadingText>
      )}

      {/* 에러 상태 */}
      {error && (
        <ErrorText style={{ color: getColor('error', '400') }}>
          리더 정보를 불러오는데 실패했습니다: {error}
        </ErrorText>
      )}

      {/* 리더 목록 */}
      {!isLoading && !error && (
        <CharacterGrid>
          {readers.map((reader) => (
            <CharacterCard
              key={reader.type}
              onClick={() => handleReaderSelect(reader)}
              isSelected={selectedReader?.type === reader.type}
              style={{
                ...globalStyles.card,
                border: `2px solid ${
                  selectedReader?.type === reader.type
                    ? getColor('accent', '400')
                    : getColor('primary', '700')
                }`,
                backgroundColor: selectedReader?.type === reader.type
                  ? getColor('accent', '900')
                  : 'transparent'
              }}
            >
              <CharacterAvatar
                style={{
                  background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`
                }}
              >
                {reader.type}
              </CharacterAvatar>

              <CharacterInfo>
                <CharacterTitle
                  style={{
                    ...globalStyles.subheading,
                    color: getColor('accent', '300')
                  }}
                >
                  {reader.name}
                </CharacterTitle>

                <CharacterDescription
                  style={{
                    ...globalStyles.body,
                    color: getColor('primary', '400')
                  }}
                >
                  {reader.description}
                </CharacterDescription>
              </CharacterInfo>
            </CharacterCard>
          ))}
        </CharacterGrid>
      )}

      <ButtonGroup gap="large">
        <Button 
          variant="secondary"
          size="large"
          onClick={onPrev}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={handleNext}
          disabled={!selectedReader}
        >
          다음
        </Button>
      </ButtonGroup>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  max-width: 1000px;
  width: 100%;
  margin-bottom: 40px;
`;

const CharacterCard = styled.div<{ isSelected?: boolean }>`
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 12px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const CharacterAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary-900);
  margin-bottom: 20px;
`;

const CharacterInfo = styled.div`
  flex: 1;
`;

const CharacterTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 15px;
`;

const CharacterDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const LoadingText = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

const ErrorText = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

export default Onboarding5Page;