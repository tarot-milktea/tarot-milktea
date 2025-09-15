import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { useColors } from '../../../hooks/useColors';

interface BaseInputProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'error';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}

interface TextareaProps extends BaseInputProps {
  as: 'textarea';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  autoFocus?: boolean;
  readOnly?: boolean;
}

type InputProps = TextInputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ size = 'medium', variant = 'default', fullWidth = true, className, ...props }, ref) => {
    const { getColor } = useColors();

    const isTextarea = 'as' in props && props.as === 'textarea';

    const baseStyle = {
      border: `2px solid ${variant === 'error' ? '#ef4444' : getColor('primary', '700')}`,
      background: getColor('primary', '900'),
      color: getColor('primary', '200'),
    };

    if (isTextarea) {
      const textareaProps = props as TextareaProps;
      return (
        <StyledTextarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          size={size}
          variant={variant}
          fullWidth={fullWidth}
          resize={textareaProps.resize || 'vertical'}
          rows={textareaProps.rows || 3}
          className={className}
          style={baseStyle}
          {...(textareaProps as any)}
        />
      );
    }

    const inputProps = props as TextInputProps;
    return (
      <StyledInput
        ref={ref as React.Ref<HTMLInputElement>}
        type={inputProps.type || 'text'}
        size={size}
        variant={variant}
        fullWidth={fullWidth}
        className={className}
        style={baseStyle}
        {...(inputProps as any)}
      />
    );
  }
);

Input.displayName = 'Input';

const baseStyles = `
  font-family: inherit;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  outline: none;

  &::placeholder {
    color: var(--color-primary-500);
    opacity: 1;
  }

  &:focus {
    border-color: var(--color-accent-400);
    box-shadow: 0 0 0 3px rgba(255, 237, 77, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--color-primary-800);
  }

  &:read-only {
    background: var(--color-primary-800);
    cursor: default;
  }
`;

const StyledInput = styled.input<{
  size: 'small' | 'medium' | 'large';
  variant: 'default' | 'error';
  fullWidth: boolean;
}>`
  ${baseStyles}

  /* 사이즈별 스타일 */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 10px 12px;
          font-size: 0.875rem;
          min-height: 40px;
        `;
      case 'large':
        return `
          padding: 16px 20px;
          font-size: 1.125rem;
          min-height: 56px;
        `;
      default: // medium
        return `
          padding: 12px 16px;
          font-size: 1rem;
          min-height: 48px;
        `;
    }
  }}

  /* 너비 설정 */
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  /* 에러 상태 */
  ${props => props.variant === 'error' && `
    border-color: #ef4444;
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

const StyledTextarea = styled.textarea<{
  size: 'small' | 'medium' | 'large';
  variant: 'default' | 'error';
  fullWidth: boolean;
  resize: 'none' | 'vertical' | 'horizontal' | 'both';
}>`
  ${baseStyles}

  /* 사이즈별 스타일 */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 10px 12px;
          font-size: 0.875rem;
          min-height: 80px;
        `;
      case 'large':
        return `
          padding: 16px 20px;
          font-size: 1.125rem;
          min-height: 120px;
        `;
      default: // medium
        return `
          padding: 12px 16px;
          font-size: 1rem;
          min-height: 100px;
        `;
    }
  }}

  /* 너비 설정 */
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  /* 리사이즈 설정 */
  resize: ${props => props.resize};

  /* 에러 상태 */
  ${props => props.variant === 'error' && `
    border-color: #ef4444;
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}

  /* 줄 높이 설정 */
  line-height: 1.5;
`;

export default Input;