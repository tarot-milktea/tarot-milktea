# 🔮 타로 카드 서비스 컬러 시스템

타로 카드 점궤 서비스를 위한 완전한 컬러 시스템입니다. 모든 컴포넌트에서 일관된 디자인을 적용할 수 있도록 설계되었습니다.

## 📁 파일 구조

```
src/
├── assets/
│   ├── colors.css          # 메인 컬러 팔레트 CSS 파일
│   └── README.md          # 이 파일
├── types/
│   └── colors.ts          # TypeScript 타입 정의 및 헬퍼 함수
├── hooks/
│   └── useColors.ts       # React 커스텀 훅
└── utils/
    └── colorUtils.ts      # CSS-in-JS용 유틸리티 함수들
```

## 🎨 컬러 팔레트

### 메인 컬러
- **Primary**: #3c1262 기반 보라색 계열 (50-900 스케일)
- **Accent**: 노랑색 계열 포인트 컬러 (50-900 스케일)
- **Gold**: 고급스러운 금색 계열 (카드나 특별한 요소용)

### 시맨틱 컬러
- `--color-background`: 어두운 보라색 배경
- `--color-text`: 밝은 회색 텍스트
- `--color-card`: 카드 배경
- `--color-border`: 테두리 색상
- `--color-text-accent`: 노랑색 강조 텍스트

## 🚀 사용 방법

### 1. CSS에서 직접 사용 (가장 간단)

```css
.my-component {
  background-color: var(--color-primary-500);
  color: var(--color-text);
  border: 1px solid var(--color-border-accent);
  box-shadow: var(--shadow-card);
}
```

### 2. React 컴포넌트에서 useColors 훅 사용 (권장)

```tsx
import { useColors } from '../hooks/useColors';

function TarotCard() {
  const { styles, getSemanticColor, getGradient } = useColors();
  
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🔮 타로 카드</h1>
      <div style={{
        background: getGradient('mystical'),
        ...styles.card
      }}>
        <p style={styles.body}>카드 내용</p>
        <button style={styles.primaryButton}>카드 선택</button>
      </div>
    </div>
  );
}
```

### 3. CSS-in-JS (styled-components, emotion)에서 사용

```tsx
import { colors, gradients, shadows, stylePresets } from '../utils/colorUtils';
import styled from 'styled-components';

const TarotCard = styled.div`
  background: ${gradients.mystical()};
  color: ${colors.text()};
  box-shadow: ${shadows.glow()};
  border-radius: 12px;
  padding: 20px;
  
  &:hover {
    ${stylePresets.tarotCard['&:hover']}
  }
`;

const MysticalButton = styled.button`
  ${stylePresets.buttonPrimary}
`;
```

### 4. TypeScript에서 타입 안전하게 사용

```tsx
import { getColorVariable, getSemanticColorVariable } from '../types/colors';

// 타입 안전한 컬러 변수 생성
const primaryColor = getColorVariable('primary', '500'); // ✅ 타입 체크됨
const textColor = getSemanticColorVariable('text');      // ✅ 타입 체크됨

// 잘못된 사용 (컴파일 에러 발생)
// const wrongColor = getColorVariable('invalid', '500'); // ❌ 에러!
```

## 🎯 주요 기능

### 🎨 useColors 훅의 모든 기능

```tsx
import { useColors } from '../hooks/useColors';

function MyComponent() {
  const { 
    // 기본 컬러 함수들
    getColor,           // getColor('primary', '500')
    getSemanticColor,   // getSemanticColor('text')
    getGradient,        // getGradient('mystical')
    getShadow,          // getShadow('card')
    getTransition,      // getTransition('normal')
    
    // 테마 관리
    theme,              // 'light' | 'dark'
    toggleTheme,        // 테마 토글
    setLightTheme,      // 라이트 모드로 설정
    setDarkTheme,       // 다크 모드로 설정
    
    // 미리 정의된 스타일들
    styles,             // 모든 스타일 프리셋
    
    // 컬러 조합들
    combinations        // colorCombinations 객체
  } = useColors();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>제목</h1>
      <button style={styles.primaryButton}>버튼</button>
    </div>
  );
}
```

### 🎭 테마 전환 기능

```tsx
function ThemeToggle() {
  const { theme, toggleTheme, setLightTheme, setDarkTheme } = useColors();
  
  return (
    <div>
      <p>현재 테마: {theme}</p>
      <button onClick={toggleTheme}>테마 토글</button>
      <button onClick={setLightTheme}>라이트 모드</button>
      <button onClick={setDarkTheme}>다크 모드</button>
    </div>
  );
}
```

### 🎨 미리 정의된 스타일들

```tsx
const { styles } = useColors();

// 📦 컨테이너 스타일
styles.container      // 메인 컨테이너 (배경, 텍스트, 패딩)
styles.card          // 카드 스타일 (배경, 테두리, 그림자)

// 🔘 버튼 스타일
styles.primaryButton   // 메인 버튼 (노랑 배경, 보라 텍스트)
styles.secondaryButton // 보조 버튼 (보라 배경, 노랑 테두리)

// 📝 텍스트 스타일
styles.heading       // 제목 텍스트 (굵게, 큰 여백)
styles.subheading    // 부제목 텍스트
styles.body          // 본문 텍스트 (줄간격 1.6)
styles.muted         // 흐린 텍스트
styles.accent        // 강조 텍스트 (노랑)
styles.gold          // 금색 텍스트

// 🔮 타로 카드 전용
styles.tarotCard     // 타로 카드 스타일 (배경, 테두리, 그림자)

// 🤖 AI 분석 결과
styles.resultPositive // 긍정적 결과 (초록)
styles.resultNegative // 부정적 결과 (빨강)
styles.resultNeutral  // 중립적 결과 (파랑)
styles.resultMystical // 신비로운 결과 (노랑)
```

### 🌈 그라데이션 사용

```tsx
const { getGradient } = useColors();

// 사용 가능한 그라데이션들
getGradient('primary')   // 기본 보라색 그라데이션
getGradient('accent')    // 노랑색 그라데이션
getGradient('mystical')  // 신비로운 그라데이션 (보라→노랑)
getGradient('card')      // 카드용 그라데이션
getGradient('glow')      // 글로우 효과 그라데이션

// 사용 예시
<div style={{ background: getGradient('mystical') }}>
  신비로운 배경
</div>
```

### 🎯 특정 컬러 팔레트만 사용하기

```tsx
import { useColorPalette, useGradients } from '../hooks/useColors';

function ColorSpecificComponent() {
  // 특정 팔레트만 사용
  const { getColor } = useColorPalette('primary');
  const { getGradient } = useGradients();
  
  return (
    <div style={{ 
      background: getColor('500'),
      color: getColor('100')
    }}>
      Primary 컬러만 사용
    </div>
  );
}
```

## 🔧 커스터마이징

### 새로운 컬러 추가
`colors.css` 파일에서 새로운 CSS 변수를 추가하고, `types/colors.ts`에서 타입을 정의하세요.

### 새로운 스타일 프리셋 추가
`utils/colorUtils.ts`의 `stylePresets` 객체에 새로운 스타일을 추가하세요.

## 📱 반응형 디자인

```css
/* 모바일 */
@media (max-width: 768px) {
  .my-component {
    padding: 12px;
  }
}

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) {
  .my-component {
    padding: 16px;
  }
}

/* 데스크톱 */
@media (min-width: 1025px) {
  .my-component {
    padding: 20px;
  }
}
```