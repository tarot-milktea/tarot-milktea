import { useState } from 'react';
import styled from '@emotion/styled';
import { useColors } from '../hooks/useColors';
import { useSessionStore } from '../store/sessionStore';
import Button from '../components/common/Button/Button';
import ButtonGroup from '../components/common/Button/ButtonGroup';
import Input from '../components/common/Input';

interface Onboarding4PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding4Page({ onNext, onPrev }: Onboarding4PageProps) {
  const { styles: globalStyles, getColor } = useColors();
  const { selectedTopic, selectedQuestion, setSelectedQuestion } = useSessionStore();
  const [customQuestion, setCustomQuestion] = useState('');

  const sampleQuestions = selectedTopic?.sampleQuestions || [];

  const handleQuestionSelect = (question: string) => {
    // 이미 선택된 질문을 다시 클릭하면 선택 해제 (토글)
    if (selectedQuestion === question && !customQuestion) {
      setSelectedQuestion('');
    } else {
      setSelectedQuestion(question);
      setCustomQuestion('');
    }
  };

  const handleCustomQuestionChange = (value: string) => {
    setCustomQuestion(value);
    setSelectedQuestion(value);
  };

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
        {sampleQuestions.map((question, index) => (
          <QuestionButton
            key={index}
            onClick={() => handleQuestionSelect(question)}
            isSelected={selectedQuestion === question && !customQuestion}
            style={{
              ...globalStyles.card,
              border: `2px solid ${
                selectedQuestion === question && !customQuestion
                  ? getColor('accent', '400')
                  : getColor('primary', '700')
              }`,
              backgroundColor: selectedQuestion === question && !customQuestion
                ? getColor('accent', '900')
                : 'transparent',
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
          inputSize="medium"
          rows={4}
          resize="vertical"
          value={customQuestion}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleCustomQuestionChange(e.target.value)}
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
          disabled={!selectedQuestion.trim()}
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

const QuestionButton = styled.button<{ isSelected?: boolean }>`
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