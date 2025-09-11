import { useColors } from '../../hooks/useColors';
import Button from '../../components/Button';
import ButtonGroup from '../../components/ButtonGroup';
import styles from './Onboarding3Page.module.css';

interface Onboarding3PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding3Page({ onNext, onPrev }: Onboarding3PageProps) {
  const { styles: globalStyles, getColor } = useColors();

  const selectedTopic = '연애';
  const subTopics = ['현재 인연', '과거 인연', '미래 인연', '짝사랑', '이별', '복합'];

  return (
    <div 
      className={styles.container}
      style={{
        ...globalStyles.container
      }}
    >
      <h1 
        className={styles.title}
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        세부 주제를 선택해주세요
      </h1>
      
      <div 
        className={styles.selectedTopic}
        style={{
          ...globalStyles.card,
          background: `linear-gradient(135deg, ${getColor('accent', '400')}20 0%, ${getColor('accent', '300')}10 100%)`
        }}
      >
        <p 
          className={styles.selectedTopicText}
          style={{
            ...globalStyles.body,
            color: getColor('accent', '300')
          }}
        >
          선택된 주제: <strong>{selectedTopic}</strong>
        </p>
      </div>

      <div className={styles.subtopicGrid}>
        {subTopics.map((subTopic, index) => (
          <button
            key={index}
            className={styles.subtopicButton}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`,
              color: getColor('primary', '200')
            }}
          >
            {subTopic}
          </button>
        ))}
      </div>

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
    </div>
  );
}

export default Onboarding3Page;