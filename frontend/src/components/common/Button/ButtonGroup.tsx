import React from 'react';
import styled from '@emotion/styled';

interface ButtonGroupProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  direction?: 'row' | 'column';
  gap?: 'small' | 'medium' | 'large';
  wrap?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
  children,
  align = 'center',
  direction = 'row',
  gap = 'medium',
  wrap = true
}) => {
  return (
    <StyledButtonGroup
      align={align}
      direction={direction}
      gap={gap}
      wrap={wrap}
    >
      {children}
    </StyledButtonGroup>
  );
};

const StyledButtonGroup = styled('div', {
  shouldForwardProp: (prop) => !['align', 'direction', 'gap', 'wrap'].includes(prop),
})<{
  align: 'left' | 'center' | 'right';
  direction: 'row' | 'column';
  gap: 'small' | 'medium' | 'large';
  wrap: boolean;
}>`
  display: flex;
  align-items: center;
  box-sizing: border-box;

  /* 정렬 */
  ${props => {
    switch (props.align) {
      case 'left':
        return 'justify-content: flex-start;';
      case 'right':
        return 'justify-content: flex-end;';
      default: // center
        return 'justify-content: center;';
    }
  }}

  /* 방향 */
  flex-direction: ${props => props.direction};

  /* Gap 설정 */
  ${props => {
    const gapValue = props.gap === 'small' ? '8px' : 
                    props.gap === 'large' ? '24px' : '16px'; // medium
    return `gap: ${gapValue};`;
  }}

  /* Wrap 설정 */
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    /* 태블릿/모바일에서 버튼 크기에 따라 배치 결정 */
    ${props => props.direction === 'row' && props.wrap && `
      /* 버튼들이 좁은 화면에서도 좌우로 배치 가능한지 확인 */
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      
      & > * {
        flex: 0 0 auto;
        min-width: 120px;
        max-width: 200px;
      }
    `}
  }

  @media (max-width: 480px) {
    /* 매우 작은 화면에서만 세로 배치 */
    ${props => props.direction === 'row' && props.wrap && `
      flex-direction: column;
      align-items: center;
      
      & > * {
        width: 100%;
        max-width: 280px;
        margin: 0;
      }
    `}
  }

  /* 버튼들 사이의 시각적 구분 */
  ${props => props.direction === 'row' && `
    & > *:not(:last-child) {
      margin-right: 0;
    }
  `}

  ${props => props.direction === 'column' && `
    & > *:not(:last-child) {
      margin-bottom: 0;
    }
  `}
`;

export default ButtonGroup;