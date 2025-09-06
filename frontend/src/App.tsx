import { useColors } from './hooks/useColors';

function App() {
  const { styles, getSemanticColor, getGradient } = useColors();

  return (
    // 예시니까 컬러만 보세요
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>🔮 점술가들</h1>
        <p style={styles.body}>
          타로 카드 3장을 선택하면 AI가 점궤를 분석하여 영상으로 만들어드립니다.
        </p>
        
        <div style={{ 
          background: getGradient('mystical'), 
          padding: '20px', 
          borderRadius: '12px',
          margin: '20px 0',
          color: getSemanticColor('text')
        }}>
          <h2 style={styles.subheading}>✨ 신비로운 타로의 세계</h2>
          <p style={styles.body}>
            당신의 운명을 들여다보세요. AI가 분석한 점궤가 영상으로 펼쳐집니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button style={styles.primaryButton}>
            카드 선택하기
          </button>
          <button style={styles.secondaryButton}>
            음성으로 듣기
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={styles.subheading}>분석 결과 예시</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={styles.resultPositive}>긍정적 결과</div>
            <div style={styles.resultNegative}>주의사항</div>
            <div style={styles.resultNeutral}>중립적 결과</div>
            <div style={styles.resultMystical}>신비로운 결과</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
