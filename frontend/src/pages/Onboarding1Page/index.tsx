import { useColors } from '../../hooks/useColors';
import styles from './Onboarding1Page.module.css';

function Onboarding1Page() {
  const { styles: globalStyles, getColor } = useColors();

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
        🔮 타로 인사이트에 오신 것을 환영합니다
      </h1>
      
      <p 
        className={styles.description}
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        닉네임을 입력해주세요
      </p>

      <div 
        className={styles.inputCard}
        style={{
          ...globalStyles.card
        }}
      >
        <input 
          type="text" 
          placeholder="닉네임 입력 (자동 생성됨)"
          className={styles.nicknameInput}
          style={{
            border: `2px solid ${getColor('primary', '700')}`,
            background: getColor('primary', '900'),
            color: getColor('primary', '200')
          }}
        />
        
        <button 
          className={styles.startButton}
          style={{
            ...globalStyles.primaryButton
          }}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

export default Onboarding1Page;