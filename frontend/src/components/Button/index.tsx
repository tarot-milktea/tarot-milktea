import React from 'react';
import styled from '@emotion/styled';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  type = 'button',
  onClick,
  children,
  ...rest 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button<{
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'small' | 'medium' | 'large';
}>`
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  text-decoration: none;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  /* 접근성을 위한 최소 터치 영역 */
  min-height: 48px;
  min-width: 48px;

  /* 사이즈별 스타일 */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 0.875rem;
          min-height: 40px;
        `;
      case 'large':
        return `
          padding: 16px 32px;
          font-size: 1.125rem;
          min-height: 56px;
        `;
      default: // medium
        return `
          padding: 12px 24px;
          font-size: 1rem;
          min-height: 48px;
        `;
    }
  }}

  /* Variant별 스타일 */
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: var(--color-primary-700);
          color: var(--color-primary-200);
          border: 2px solid var(--color-primary-600);
          
          &:hover:not(:disabled) {
            background: var(--color-primary-600);
            border-color: var(--color-primary-500);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: var(--color-primary-300);
          border: 2px solid var(--color-primary-600);
          
          &:hover:not(:disabled) {
            background: var(--color-primary-800);
            border-color: var(--color-primary-500);
            color: var(--color-primary-200);
            transform: translateY(-2px);
          }
        `;
      default: // primary
        return `
          background: var(--color-accent-400);
          color: var(--color-primary-900);
          border: 2px solid transparent;
          
          &:hover:not(:disabled) {
            background: var(--color-accent-500);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 237, 77, 0.4);
          }
        `;
    }
  }}

  /* Disabled 상태 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Active 상태 */
  &:active:not(:disabled) {
    transform: translateY(0px);
  }

  /* 포커스 상태 */
  &:focus-visible {
    outline: 2px solid var(--color-accent-400);
    outline-offset: 2px;
  }

  /* 리플 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.6s, height 0.6s, top 0.6s, left 0.6s;
    transform: translate(-50%, -50%);
    z-index: 0;
  }

  &:active:not(:disabled)::before {
    width: 200px;
    height: 200px;
  }

  /* 텍스트가 리플 효과 위에 오도록 */
  & > * {
    position: relative;
    z-index: 1;
  }
`;

export default Button;