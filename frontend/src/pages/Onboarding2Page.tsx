import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import { useDataStore } from '../store/dataStore';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';

interface Onboarding2PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding2Page({ onNext, onPrev }: Onboarding2PageProps) {
  const { styles: globalStyles, getColor } = useColors();
  const { categories, isLoading, error } = useDataStore();
  const { selectedCategory, setSelectedCategory } = useSessionStore();

  const handleCategorySelect = (category: any) => {
    // 이미 선택된 카테고리를 다시 클릭하면 선택 해제 (토글)
    if (selectedCategory?.code === category.code) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
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
        어떤 주제로 타로를 보시겠어요?
      </Title>
      
      <Description 
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        관심 있는 분야를 선택해주세요
      </Description>

      {/* 로딩 상태 */}
      {isLoading && (
        <LoadingText style={{ color: getColor('primary', '300') }}>
          카테고리를 불러오는 중...
        </LoadingText>
      )}

      {/* 에러 상태 */}
      {error && (
        <ErrorText style={{ color: getColor('error', '400') }}>
          카테고리를 불러오는데 실패했습니다: {error}
        </ErrorText>
      )}

      {/* 카테고리 목록 */}
      {!isLoading && !error && (
        <TopicGrid>
          {categories.map((category) => (
            <TopicButton
              key={category.code}
              onClick={() => handleCategorySelect(category)}
              isSelected={selectedCategory?.code === category.code}
              style={{
                ...globalStyles.card,
                border: `2px solid ${
                  selectedCategory?.code === category.code
                    ? getColor('accent', '400')
                    : getColor('primary', '700')
                }`,
                backgroundColor: selectedCategory?.code === category.code
                  ? getColor('accent', '900')
                  : 'transparent',
                color: getColor('primary', '200')
              }}
            >
              <CategoryTitle>{category.name}</CategoryTitle>
              <CategoryDescription>{category.description}</CategoryDescription>
            </TopicButton>
          ))}
        </TopicGrid>
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
          onClick={onNext}
          disabled={!selectedCategory}
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

const TopicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 40px;
`;

const TopicButton = styled.button<{ isSelected?: boolean }>`
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  background: none;
  border-radius: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const CategoryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const CategoryDescription = styled.p`
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.4;
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

export default Onboarding2Page;