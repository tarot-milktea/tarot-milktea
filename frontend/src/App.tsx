import { useColors } from './hooks/useColors';
import type { ColorPalette } from './types/colors';

function App() {
  const { styles, getColor, theme, toggleTheme } = useColors();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px',
      width: '100%',
      minHeight: '100vh'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px'
      }}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '12px 16px',
          border: `2px solid ${getColor('accent', '400')}`,
          background: theme === 'dark' ? getColor('primary', '900') : getColor('primary', '100'),
          color: getColor('accent', '400'),
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}
      >
        {theme === 'dark' ? '☀️ 라이트' : '🌙 다크'}
      </button>

      {/* Header Section */}
      <header style={{
        width: '100%',
        textAlign: 'center',
        paddingTop: '60px'
      }}>
        <h1 style={{
          ...styles.heading,
          fontSize: '3.5rem',
          color: getColor('primary', '200'),
          marginBottom: '12px',
          fontWeight: '300',
          letterSpacing: '0.02em'
        }}>
          타로 인사이트
        </h1>
        <p style={{
          ...styles.muted,
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.7'
        }}>
          최첨단 AI가 해석하는 신비로운 타로 카드의 세계를 경험해보세요
        </p>
      </header>

      {/* Main Feature Card */}
      <section style={{
        ...styles.card,
        width: '100%',
        maxWidth: '800px',
        background: `linear-gradient(135deg, ${getColor('primary', '900')} 0%, ${getColor('primary', '800')} 100%)`,
        border: `1px solid ${getColor('primary', '700')}`,
        padding: '50px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${getColor('accent', '400')}08 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            ...styles.heading,
            fontSize: '2rem',
            color: getColor('primary', '100'),
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            3장 카드 리딩
          </h2>
          
          <p style={{
            ...styles.body,
            fontSize: '1.1rem',
            color: getColor('primary', '300'),
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto 40px',
            lineHeight: '1.8'
          }}>
            과거, 현재, 미래를 보여주는 세 장의 카드를 선택하세요.
            AI가 당신만을 위한 맞춤형 영상 해석을 제공합니다.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '40px'
          }}>
            <button style={{
              ...styles.primaryButton,
              padding: '16px 32px',
              fontSize: '1rem',
              background: `linear-gradient(45deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '300')} 100%)`,
              color: getColor('primary', '900'),
              boxShadow: `0 4px 20px ${getColor('accent', '400')}40`,
              border: 'none'
            }}>
              리딩 시작하기
            </button>
            
            <button style={{
              ...styles.secondaryButton,
              padding: '16px 32px',
              fontSize: '1rem',
              background: 'transparent',
              color: getColor('accent', '300'),
              border: `2px solid ${getColor('accent', '400')}60`,
              boxShadow: 'none'
            }}>
              자세히 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        padding: '0 20px'
      }}>
        {[
          {
            title: 'AI 기반 분석',
            description: '고도화된 알고리즘이 전통적인 타로 의미를 현대적 정확성으로 해석합니다',
            color: 'primary'
          },
          {
            title: '영상 해석 서비스',
            description: '아름답게 제작된 영상 내러티브로 당신의 운세를 받아보세요',
            color: 'accent'
          },
          {
            title: '개인 맞춤 인사이트',
            description: '당신만의 독특한 카드 조합을 바탕으로 맞춤형 가이드를 제공합니다',
            color: 'gold'
          }
        ].map((feature, index) => (
          <div key={index} style={{
            ...styles.card,
            background: `${getColor('primary', '900')}80`,
            border: `1px solid ${getColor('primary', '700')}60`,
            padding: '30px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${getColor(feature.color as ColorPalette, '400')} 0%, ${getColor(feature.color as ColorPalette, '600')} 100%)`,
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: getColor('primary', '100'),
                borderRadius: '50%'
              }} />
            </div>
            
            <h3 style={{
              ...styles.subheading,
              color: getColor('primary', '200'),
              fontSize: '1.2rem',
              marginBottom: '16px'
            }}>
              {feature.title}
            </h3>
            
            <p style={{
              ...styles.body,
              color: getColor('primary', '400'),
              lineHeight: '1.7',
              fontSize: '0.95rem'
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        width: '100%',
        textAlign: 'center',
        padding: '40px 20px',
        borderTop: `1px solid ${getColor('primary', '800')}`,
        marginTop: '60px'
      }}>
        <p style={{
          ...styles.muted,
          fontSize: '0.9rem',
          color: getColor('primary', '600')
        }}>
          인공지능을 통해 발견하는 카드 속 깊은 지혜
        </p>
      </footer>
      </div>
    </div>
  )
}

export default App
