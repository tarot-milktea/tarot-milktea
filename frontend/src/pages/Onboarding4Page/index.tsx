import { useColors } from '../../hooks/useColors';
import styles from './Onboarding4Page.module.css';

function Onboarding4Page() {
  const { styles: globalStyles, getColor } = useColors();

  const questions = [
    '지금 인연과 미래를 기약해도 될까?',
    '현재 연인과 헤어져야 할까?',
    '새로운 만남이 언제 생길까?',
    '짝사랑이 이루어질 수 있을까?',
    '과거의 인연과 다시 만날 수 있을까?'
  ];

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
        구체적인 질문을 선택해주세요
      </h1>

      <div className={styles.questionList}>
        {questions.map((question, index) => (
          <button
            key={index}
            className={styles.questionButton}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`,
              color: getColor('primary', '200')
            }}
          >
            {question}
          </button>
        ))}
      </div>

      <div 
        className={styles.customInput}
        style={{
          ...globalStyles.card
        }}
      >
        <p 
          className={styles.customInputLabel}
          style={{
            ...globalStyles.body,
            color: getColor('primary', '300')
          }}
        >
          직접 작성하기
        </p>
        <textarea
          placeholder="궤금한 질문을 자유롭게 작성해주세요..."
          className={styles.textarea}
          style={{
            border: `2px solid ${getColor('primary', '700')}`,
            background: getColor('primary', '900'),
            color: getColor('primary', '200')
          }}
        />
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

export default Onboarding4Page;