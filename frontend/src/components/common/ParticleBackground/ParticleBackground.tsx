import styled from '@emotion/styled';
import { motion } from 'framer-motion';

interface ParticleBackgroundProps {
  particleCount?: number;
  intensity?: 'light' | 'medium' | 'heavy';
}

function ParticleBackground({
  particleCount = 20,
  intensity = 'light'
}: ParticleBackgroundProps) {
  const intensityConfig = {
    light: {
      maxSize: 3,
      minSize: 1,
      opacity: [0.3, 0.7, 0.3],
      duration: { min: 4, max: 8 },
    },
    medium: {
      maxSize: 4,
      minSize: 2,
      opacity: [0.4, 0.8, 0.4],
      duration: { min: 3, max: 6 },
    },
    heavy: {
      maxSize: 5,
      minSize: 2.5,
      opacity: [0.5, 0.9, 0.5],
      duration: { min: 2, max: 4 },
    },
  };

  const config = intensityConfig[intensity];

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * (config.maxSize - config.minSize) + config.minSize,
    delay: Math.random() * 3,
    duration: Math.random() * (config.duration.max - config.duration.min) + config.duration.min,
  }));

  return (
    <ParticleContainer>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          top={particle.top}
          left={particle.left}
          size={particle.size}
          animate={{
            opacity: config.opacity,
            scale: [0.8, 1.2, 0.8],
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </ParticleContainer>
  );
}

const ParticleContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
`;

const Particle = styled(motion.div)<{ top: string; left: string; size: number }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: #fff280;
  border-radius: 50%;
  box-shadow: 0 0 8px #fff280;
`;

export default ParticleBackground;