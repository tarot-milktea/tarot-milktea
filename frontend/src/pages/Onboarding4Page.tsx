import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
import Input from '../components/common/Input';

interface Onboarding4PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding4Page({ onNext, onPrev }: Onboarding4PageProps) {
  const { styles: globalStyles, getColor } = useColors();

  const questions = [
    '지금 인연과 미래를 기약해도 될까?',
    '현재 연인과 헤어져야 할까?',
    '새로운 만남이 언제 생길까?',
    '짝사랑이 이루어질 수 있을까?',
    '과거의 인연과 다시 만날 수 있을까?'
  ];

  return (
    <Container style={globalStyles.container}>
      <Title 
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        구체적인 질문을 선택해주세요
      </Title>

      <QuestionList>
        {questions.map((question, index) => (
          <QuestionButton
            key={index}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`,
              color: getColor('primary', '200')
            }}
          >
            {question}
          </QuestionButton>
        ))}
      </QuestionList>

      <CustomInput style={globalStyles.card}>
        <CustomInputLabel 
          style={{
            ...globalStyles.body,
            color: getColor('primary', '300')
          }}
        >
          직접 작성하기
        </CustomInputLabel>
        <Input
          as="textarea"
          placeholder="궁금한 질문을 자유롭게 작성해주세요..."
          size="medium"
          rows={4}
          resize="vertical"
        />
      </CustomInput>

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
  margin-bottom: 30px;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  width: 100%;
  margin-bottom: 30px;
`;

const QuestionButton = styled.button`
  padding: 20px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-align: left;
  background: none;
  border-radius: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const CustomInput = styled.div`
  padding: 30px;
  max-width: 600px;
  width: 100%;
  margin-bottom: 40px;
`;

const CustomInputLabel = styled.p`
  font-size: 1.1rem;
  margin-bottom: 15px;
`;


export default Onboarding4Page;