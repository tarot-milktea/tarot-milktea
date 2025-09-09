import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useColors } from '../../hooks/useColors';
import styles from './ResultPage.module.css';

interface TarotResult {
  cards: string[];
  nickname?: string;
  topic?: string;
  question?: string;
}

function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const [result, setResult] = useState<TarotResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) {
      // localStorage에서 결과 데이터 가져오기
      const savedResult = localStorage.getItem(`tarot_${resultId}`);
      
      if (savedResult) {
        try {
          const parsedResult = JSON.parse(savedResult);
          setResult(parsedResult);
        } catch (error) {
          console.error('결과 파싱 실패:', error);
          navigate('/', { replace: true });
        }
      } else {
        // 결과가 없으면 홈으로 리다이렉트
        navigate('/', { replace: true });
      }
    }
    setLoading(false);
  }, [resultId, navigate]);

  const shareResult = () => {
    if (resultId) {
      const shareUrl = `${window.location.origin}/result/${resultId}`;
      
      if (navigator.share) {
        navigator.share({
          title: '🔮 내 타로 결과',
          text: '타로 인사이트로 본 내 운세를 확인해보세요!',
          url: shareUrl,
        });
      } else {
        // Web Share API 지원하지 않으면 클립보드에 복사
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('링크가 클립보드에 복사되었습니다!');
        });
      }
    }
  };

  const downloadVideo = () => {
    // TODO: 실제 영상 다운로드 구현
    alert('영상 다운로드 기능은 준비중입니다.');
  };

  if (loading) {
    return (
      <div style={{
        ...globalStyles.container,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <p style={{
          ...globalStyles.body,
          color: getColor('primary', '300'),
          fontSize: '1.2rem'
        }}>
          결과를 불러오는 중...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{
        ...globalStyles.container,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        <div>
          <p style={{
            ...globalStyles.body,
            color: getColor('primary', '300'),
            fontSize: '1.2rem',
            marginBottom: '20px'
          }}>
            결과를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              ...globalStyles.primaryButton,
              padding: '12px 24px'
            }}
          >
            새로운 타로 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.container}
      style={{
        ...globalStyles.container
      }}
    >
      <div className={styles.content}>
        <h1 
          className={styles.title}
          style={{
            ...globalStyles.heading,
            color: getColor('primary', '200')
          }}
        >
          🔮 타로 해석 결과
        </h1>

        {/* 영상 플레이어 영역 - 나중에 실제 영상 플레이어로 대체 */}
        <div 
          className={styles.videoPlayer}
          style={{
            ...globalStyles.card,
            background: `linear-gradient(135deg, ${getColor('primary', '900')} 0%, ${getColor('primary', '800')} 100%)`,
            border: `2px solid ${getColor('accent', '400')}40`
          }}
        >
          <div 
            className={styles.playIcon}
            style={{
              color: getColor('accent', '400')
            }}
          >
            ▶️
          </div>
          <p 
            className={styles.videoLabel}
            style={{
              ...globalStyles.body,
              color: getColor('primary', '300')
            }}
          >
            AI가 생성한 맞춤형 타로 해석 영상
          </p>
        </div>

        {/* 카드 정보 */}
        <div className={styles.cardGrid}>
          {[
            { period: '과거', card: 'The Fool', meaning: '새로운 시작과 모험' },
            { period: '현재', card: 'The Lovers', meaning: '선택과 관계의 조화' },
            { period: '미래', card: 'The Star', meaning: '희망과 영감' }
          ].map((cardInfo, index) => (
            <div 
              key={index} 
              className={styles.cardInfo}
              style={{
                ...globalStyles.card,
                background: `linear-gradient(135deg, ${getColor('primary', '900')}90 0%, ${getColor('primary', '800')}50 100%)`
              }}
            >
              <div 
                className={styles.cardImage}
                style={{
                  background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`,
                  boxShadow: `0 4px 20px ${getColor('accent', '400')}40`
                }}
              >
                🃏
              </div>
              
              <h3 
                className={styles.cardPeriod}
                style={{
                  ...globalStyles.subheading,
                  color: getColor('accent', '300')
                }}
              >
                {cardInfo.period}
              </h3>
              
              <h4 
                className={styles.cardName}
                style={{
                  ...globalStyles.body,
                  color: getColor('primary', '200')
                }}
              >
                {cardInfo.card}
              </h4>
              
              <p 
                className={styles.cardMeaning}
                style={{
                  ...globalStyles.body,
                  color: getColor('primary', '400')
                }}
              >
                {cardInfo.meaning}
              </p>
            </div>
          ))}
        </div>

        {/* 액션 버튼들 */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.actionButton}
            onClick={() => navigate('/')}
            style={{
              ...globalStyles.primaryButton
            }}
          >
            다시 타로보기
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={shareResult}
            style={{
              ...globalStyles.secondaryButton
            }}
          >
            결과 공유하기
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={downloadVideo}
            style={{
              ...globalStyles.secondaryButton
            }}
          >
            영상 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;