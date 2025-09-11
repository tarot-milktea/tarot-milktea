import { useColors } from '../../hooks/useColors';
import Button from '../../components/Button';
import ButtonGroup from '../../components/ButtonGroup';
import styles from './Onboarding2Page.module.css';

interface Onboarding2PageProps {
  onNext: () => void;
  onPrev: () => void;
}

function Onboarding2Page({ onNext, onPrev }: Onboarding2PageProps) {
  const { styles: globalStyles, getColor } = useColors();

  const topics = ['취업', '연애', '금전', '건강', '인간관계', '학업'];

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
        어떤 주제로 타로를 보시겠어요?
      </h1>
      
      <p 
        className={styles.description}
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        관심 있는 분야를 선택해주세요
      </p>

      <div className={styles.topicGrid}>
        {topics.map((topic, index) => (
          <button
            key={index}
            className={styles.topicButton}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`,
              color: getColor('primary', '200')
            }}
          >
            {topic}
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

export default Onboarding2Page;