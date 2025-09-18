import styled from '@emotion/styled';
import { useColors } from '../../../hooks/useColors';

// Logo assets
import LogoIconImage from '../../../assets/Logos/LogoIcon.png';
import LogoYellowImage from '../../../assets/Logos/LogoYellow.png';
import LogoPurpleImage from '../../../assets/Logos/LogoPurple.png';

interface LogoProps {
  className?: string;
}

function Logo({ className }: LogoProps) {
  const { theme } = useColors();
  const isDark = theme === 'dark';

  return (
    <LogoContainer className={className}>
      <LogoIcon src={LogoIconImage} alt="타로밀크티" />
      <LogoText
        src={isDark ? LogoYellowImage : LogoPurpleImage}
        alt="타로밀크티"
      />
    </LogoContainer>
  );
}

const LogoContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  padding-top: 80px;
  overflow: visible;
`;

const LogoIcon = styled.img`
  width: 130px;
  height: 130px;
  object-fit: contain;
  opacity: 0.4;
  filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.12));
  position: absolute;
  z-index: 1;
  transform: translateY(-50px) translateX(-25px);
`;

const LogoText = styled.img`
  height: 90px;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(251, 191, 36, 0.4));
  position: relative;
  z-index: 2;
`;

export default Logo;