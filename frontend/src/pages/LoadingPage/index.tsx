import { useEffect } from 'react';
import { useColors } from '../../hooks/useColors';
import styles from './LoadingPage.module.css';

interface LoadingPageProps {
  onComplete?: () => void;
}

function LoadingPage({ onComplete }: LoadingPageProps) {
  const { styles: globalStyles, getColor } = useColors();

  // 3초 후 결과 페이지로 이동
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div 
      className={styles.container}
      style={{
        ...globalStyles.container
      }}
    >
      {/* 배경 안개 효과 - 나중에 실제 안개 애니메이션으로 대체 */}
      <div 
        className={styles.backgroundFog}
        style={{
          background: `radial-gradient(ellipse at center, ${getColor('accent', '400')}15 0%, ${getColor('primary', '900')}90 50%, ${getColor('primary', '900')} 100%)`
        }}
      />

      <div className={styles.content}>
        {/* 로딩 스피너 */}
        <div 
          className={styles.spinner}
          style={{
            border: `4px solid ${getColor('primary', '700')}`,
            borderTop: `4px solid ${getColor('accent', '400')}`
          }}
        />

        <h1 
          className={styles.title}
          style={{
            ...globalStyles.heading,
            color: getColor('primary', '200')
          }}
        >
          결과를 생성 중입니다
        </h1>
        
        <p 
          className={styles.description}
          style={{
            ...globalStyles.body,
            color: getColor('primary', '300')
          }}
        >
          선택하신 카드를 바탕으로 AI가 맞춤형 해석을 준비하고 있습니다.<br />
          잠시만 기다려주세요...
        </p>

        {/* 선택된 카드들 미리보기 */}
        <div className={styles.cardPreview}>
          {['과거', '현재', '미래'].map((period, index) => (
            <div key={index} className={styles.cardContainer}>
              <div 
                className={styles.card}
                style={{
                  background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`,
                  boxShadow: `0 4px 20px ${getColor('accent', '400')}40`
                }}
              >
                🃏
              </div>
              <span 
                className={styles.cardLabel}
                style={{
                  ...globalStyles.body,
                  color: getColor('accent', '300')
                }}
              >
                {period}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;