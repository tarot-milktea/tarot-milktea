import React from 'react';
import styled from '@emotion/styled';
import { useColors } from '../../hooks/useColors';

interface ThemeToggleProps {
  position?: 'fixed' | 'absolute';
  top?: string | number;
  right?: string | number;
  left?: string | number;
  bottom?: string | number;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  position = 'fixed',
  top = '20px',
  right = '20px',
  left,
  bottom,
  className
}) => {
  const { theme, toggleTheme, getColor } = useColors();

  return (
    <StyledThemeToggle
      onClick={toggleTheme}
      position={position}
      top={top}
      right={right}
      left={left}
      bottom={bottom}
      className={className}
      style={{
        border: `2px solid ${getColor('accent', '400')}`,
        background: theme === 'dark' ? getColor('primary', '900') : getColor('primary', '100'),
        color: getColor('accent', '400')
      }}
    >
      {theme === 'dark' ? '라이트' : '다크'}
    </StyledThemeToggle>
  );
};

const StyledThemeToggle = styled.button<{
  position: 'fixed' | 'absolute';
  top?: string | number;
  right?: string | number;
  left?: string | number;
  bottom?: string | number;
}>`
  position: ${props => props.position};
  ${props => props.top !== undefined && `top: ${typeof props.top === 'number' ? `${props.top}px` : props.top};`}
  ${props => props.right !== undefined && `right: ${typeof props.right === 'number' ? `${props.right}px` : props.right};`}
  ${props => props.left !== undefined && `left: ${typeof props.left === 'number' ? `${props.left}px` : props.left};`}
  ${props => props.bottom !== undefined && `bottom: ${typeof props.bottom === 'number' ? `${props.bottom}px` : props.bottom};`}
  
  z-index: 1000;
  padding: 12px 16px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: inherit;
  
  /* 접근성을 위한 최소 터치 영역 */
  min-height: 44px;
  min-width: 44px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 237, 77, 0.3);
  }
  
  &:active {
    transform: translateY(0px);
  }

  /* 포커스 상태 */
  &:focus-visible {
    outline: 2px solid var(--color-accent-400);
    outline-offset: 2px;
  }
`;

export default ThemeToggle;