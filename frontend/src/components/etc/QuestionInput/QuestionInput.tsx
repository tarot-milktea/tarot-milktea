import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import styled from '@emotion/styled';
import { useColors } from '../../../hooks/useColors';
import Input from '../../common/Input/Input';
import { validateQuestion } from '../../../utils/questionValidator';
import { showToast } from '../../common/Toast';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  inputSize?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  showLiveValidation?: boolean;
}

const QuestionInput = forwardRef<HTMLInputElement, QuestionInputProps>(({
  value,
  onChange,
  onValidationChange,
  placeholder = "궁금한 질문을 작성해주세요",
  inputSize = "large",
  disabled = false,
  autoFocus = false,
  className,
  showLiveValidation = true,
  ...props
}, ref) => {
  const { getColor } = useColors();
  const [error, setError] = useState<string>('');
  const [isTouched, setIsTouched] = useState<boolean>(false);

  // 유효성 검사 실행
  const performValidation = useCallback((question: string) => {
    const validationError = validateQuestion(question);
    setError(validationError);

    const isValid = !validationError;
    onValidationChange?.(isValid, validationError);

    return isValid;
  }, [onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // 200자 초과 방지 (UI에서 입력 자체를 막음)
    if (newValue.length > 200) {
      return;
    }

    onChange(newValue);

    // 즉시 validation 실행 (값이 있을 때)
    if (showLiveValidation && newValue.trim()) {
      performValidation(newValue);
    } else if (showLiveValidation && !newValue.trim()) {
      // 빈 값일 때도 validation 상태 업데이트
      const validationError = validateQuestion(newValue);
      setError(validationError);
      onValidationChange?.(false, validationError);
    }
  };

  // 포커스 아웃 핸들러 - 에러 상황에서만 토스트 표시
  const handleBlur = () => {
    setIsTouched(true);
    if (value.trim()) {
      const isValid = performValidation(value);

      // 에러 상황에서만 Toast 메시지 표시
      if (!isValid && error) {
        showToast.error(error);
      }
    }
  };

  useEffect(() => {
    if (value && isTouched) {
      performValidation(value);
    }
  }, [value, isTouched, performValidation]);

  const hasError = isTouched && showLiveValidation && error;

  return (
    <QuestionInputContainer className={className}>
      <Input
        ref={ref}
        as="textarea"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        inputSize={inputSize}
        rows={4}
        resize="vertical"
        variant={hasError ? 'error' : 'default'}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        {...props}
      />

      <InputMeta>
        {/* 왼쪽 에러 메시지 */}
        <ErrorSection>
          {hasError && (
            <ErrorMessage style={{ color: '#ef4444' }}>
              <ErrorIcon>⚠️</ErrorIcon>
              {error}
            </ErrorMessage>
          )}
        </ErrorSection>

        {/* 오른쪽 글자수 */}
        <CharCount
          isOverLimit={value.length > 200}
          style={{ color: getColor('primary', '400') }}
        >
          <CurrentCount isOverLimit={value.length > 200}>
            {value.length}
          </CurrentCount>
          <MaxCount>/200</MaxCount>
        </CharCount>
      </InputMeta>
    </QuestionInputContainer>
  );
});

QuestionInput.displayName = 'QuestionInput';

const QuestionInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  min-height: 20px; /* 고정 높이로 레이아웃 변화 방지 */
`;

const CharCount = styled.div<{ isOverLimit: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  opacity: ${props => props.isOverLimit ? 1 : 0.7};
`;

const CurrentCount = styled.span<{ isOverLimit: boolean }>`
  color: ${props => props.isOverLimit ? '#ef4444' : 'inherit'};
`;

const MaxCount = styled.span`
  opacity: 0.6;
`;

const ErrorSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ErrorIcon = styled.span`
  font-size: 0.875rem;
`;

export default QuestionInput;