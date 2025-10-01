import React from 'react';
import styled from '@emotion/styled';
import { useTTS } from '../../hooks/useTTS';

interface TarotResultReaderProps {
  cardName: string;
  interpretation: string;
  advice?: string;
  className?: string;
}

const TarotResultReader: React.FC<TarotResultReaderProps> = ({
  cardName,
  interpretation,
  advice,
  className
}) => {
  const { requestTTSStream, isLoading, isPlaying, stopAudio, hasError } = useTTS({
    autoPlay: true,
    onComplete: () => console.log('타로 카드 해석 읽기 완료'),
    onError: (error) => console.error('TTS 에러:', error)
  });

  const handleReadCard = async () => {
    let fullText = `뽑힌 카드는 ${cardName}입니다. `;
    fullText += interpretation;
    if (advice) {
      fullText += ` 조언: ${advice}`;
    }

    await requestTTSStream(
      fullText,
      'fable', // 신비로운 느낌의 목소리
      '신비롭고 차분한 목소리로 타로 카드의 의미를 전달해주세요'
    );
  };

  const handleReadInterpretationOnly = async () => {
    await requestTTSStream(
      interpretation,
      'nova',
      '친근하고 이해하기 쉬운 목소리로 설명해주세요'
    );
  };

  return (
    <Container className={className}>
      <CardSection>
        <CardName>{cardName}</CardName>
        <Interpretation>{interpretation}</Interpretation>
        {advice && <Advice>💡 {advice}</Advice>}
      </CardSection>

      <ControlSection>
        <ControlButton
          onClick={handleReadCard}
          disabled={isLoading}
          $primary
        >
          🔮 전체 읽기
        </ControlButton>

        <ControlButton
          onClick={handleReadInterpretationOnly}
          disabled={isLoading}
        >
          📖 해석만 읽기
        </ControlButton>

        {isPlaying && (
          <ControlButton onClick={stopAudio} $danger>
            ⏹️ 정지
          </ControlButton>
        )}
      </ControlSection>

      {isLoading && <Status>🎙️ 음성 생성 중...</Status>}
      {hasError && <Status $error>❌ 음성 생성 실패</Status>}
    </Container>
  );
};

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const CardSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const CardName = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Interpretation = styled.p`
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  opacity: 0.9;
`;

const Advice = styled.div`
  font-size: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid #ffd700;
`;

const ControlSection = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  background: ${props =>
    props.$primary ? '#28a745' :
    props.$danger ? '#dc3545' :
    'rgba(255, 255, 255, 0.2)'
  };

  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    background: ${props =>
      props.$primary ? '#218838' :
      props.$danger ? '#c82333' :
      'rgba(255, 255, 255, 0.3)'
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Status = styled.div<{ $error?: boolean }>`
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  color: ${props => props.$error ? '#ff6b6b' : '#fff'};
  opacity: 0.8;
`;

export default TarotResultReader;

// 사용 예시:
// <TarotResultReader
//   cardName="The Fool"
//   interpretation="새로운 시작과 모험을 의미합니다. 순수한 마음으로 새로운 여정을 떠날 때입니다."
//   advice="두려워하지 말고 용기 있게 첫걸음을 내디뎌보세요."
// />