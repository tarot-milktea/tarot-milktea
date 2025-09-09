import { useColors } from '../../hooks/useColors';
import styles from './Onboarding3Page.module.css';

function Onboarding3Page() {
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

      <button 
        className={styles.nextButton}
        style={{
          ...globalStyles.primaryButton
        }}
      >
        다음
      </button>
    </div>
  );
}

export default Onboarding3Page;