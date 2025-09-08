import { useColors } from '../../hooks/useColors';
import styles from './Onboarding5Page.module.css';

function Onboarding5Page() {
  const { styles: globalStyles, getColor } = useColors();

  const characters = [
    {
      type: 'T',
      title: '냉정한 분석가',
      description: '완전 냉정하고 현실적인 어투로 객관적인 분석을 제공합니다'
    },
    {
      type: 'F', 
      title: '감성적 상담사',
      description: '완전 감성적이고 공감을 잘해주는 따뜻한 어투로 위로와 격려를 전합니다'
    },
    {
      type: 'TF',
      title: '균형잡힌 조언자', 
      description: '이성과 감성의 균형을 맞춴 조화로운 해석을 제공합니다'
    }
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
        타로를 봐줄 캐릭터를 선택하세요
      </h1>
      
      <p 
        className={styles.description}
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        어떤 스타일의 해석을 받고 싶으신가요?
      </p>

      <div className={styles.characterGrid}>
        {characters.map((character, index) => (
          <div
            key={index}
            className={styles.characterCard}
            style={{
              ...globalStyles.card,
              border: `2px solid ${getColor('primary', '700')}`
            }}
          >
            <div 
              className={styles.characterAvatar}
              style={{
                background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`
              }}
            >
              {character.type}
            </div>
            
            <div>
              <h3 
                className={styles.characterTitle}
                style={{
                  ...globalStyles.subheading,
                  color: getColor('accent', '300')
                }}
              >
                {character.title}
              </h3>
              
              <p 
                className={styles.characterDescription}
                style={{
                  ...globalStyles.body,
                  color: getColor('primary', '400')
                }}
              >
                {character.description}
              </p>
            </div>
          </div>
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

export default Onboarding5Page;