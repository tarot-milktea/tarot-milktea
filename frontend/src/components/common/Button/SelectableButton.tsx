import React from 'react';
import styled from '@emotion/styled';
import { useColors } from '../../../hooks/useColors';

interface SelectableButtonProps {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
}

const SelectableButton: React.FC<SelectableButtonProps> = ({
  isSelected,
  onClick,
  children,
  className,
  textAlign = 'center'
}) => {
  const { styles: globalStyles, getColor } = useColors();

  return (
    <StyledSelectableButton
      onClick={onClick}
      isSelected={isSelected}
      className={className}
      style={{
        ...globalStyles.card,
        border: `1px solid ${
          isSelected ? '#FFD700' : getColor('primary', '700')
        }`,
        backgroundColor: 'transparent',
        color: getColor('primary', '200'),
        boxShadow: isSelected
          ? '0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.1)'
          : 'none',
        animation: isSelected ? 'shimmer 2s ease-in-out infinite' : 'none',
        textAlign
      }}
    >
      {children}
    </StyledSelectableButton>
  );
};

const StyledSelectableButton = styled.button<{ isSelected?: boolean }>`
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  background: none;
  border-radius: 12px;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  @keyframes shimmer {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.2);
    }
  }
`;

export default SelectableButton;