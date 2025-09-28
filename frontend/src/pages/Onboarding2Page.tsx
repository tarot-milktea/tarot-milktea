import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useColors } from "../hooks/useColors";
import { useDataStore } from "../store/dataStore";
import { useSessionStore, type Reader } from "../store/sessionStore";
import Button from "../components/common/Button/Button";
import ButtonGroup from "../components/common/Button/ButtonGroup";
import SelectableButton from "../components/common/Button/SelectableButton";
// import ThemeToggle from '../components/etc/ThemeToggle';
import { useOnboardingTracking } from "../hooks/useAnalytics";
import { SELECTION_TYPES } from "../utils/analyticsEvents";
import ProgressBar from "../components/common/ProgressBar/ProgressBar";
import { useProgressStore } from "../store/progressStore";
import { useTTS } from "../hooks/useTTS";
import { getTTSSettings } from "../utils/voiceMapping";
import ReaderVideo from "../components/common/ReaderVideo/ReaderVideo";

function Onboarding2Page() {
  const navigate = useNavigate();
  const { styles: globalStyles, getColor } = useColors();
  const { readers, isLoading, error } = useDataStore();
  const { selectedReader, setSelectedReader } = useSessionStore();
  const { setCurrentPage, getCurrentStep, getTotalSteps } = useProgressStore();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Analytics 훅
  const { trackComplete, trackSelection } = useOnboardingTracking(
    2,
    "reader_selection"
  );

  useEffect(() => {
    setCurrentPage("onboarding-2");
  }, [setCurrentPage]);

  // TTS 훅
  const {
    requestTTSStream,
    stopAudio,
    isPlaying,
    isLoading: ttsLoading,
  } = useTTS({
    autoPlay: true,
    onComplete: () => console.log("TTS playback completed"),
    onError: (error) => console.error("TTS error:", error),
  });


  const handleReaderSelect = async (reader: Reader) => {
    // TTS 중지
    stopAudio();

    // 이미 선택된 리더를 다시 클릭하면 선택 해제 (토글)
    if (selectedReader?.type === reader.type) {
      setSelectedReader(null);
    } else {
      setSelectedReader(reader);
      // Analytics 추적
      trackSelection(SELECTION_TYPES.READER, reader.type);

      // TTS 재생
      try {
        const ttsSettings = getTTSSettings(reader.type, reader.name);
        await requestTTSStream(
          ttsSettings.text,
          ttsSettings.voice,
          ttsSettings.instruction
        );
      } catch (error) {
        console.error("TTS 재생 실패:", error);
      }
    }
  };

  const handleNext = () => {
    if (selectedReader) {
      // TTS 중지
      stopAudio();

      // Analytics 추적
      trackComplete({
        selected_reader: selectedReader.type,
        reader_name: selectedReader.name,
      });

      navigate("/onboarding/3");
    }
  };

  const handlePrev = () => {
    // TTS 중지
    stopAudio();

    navigate("/onboarding/1");
  };

  const handleImageError = (readerType: string) => {
    setImageErrors((prev) => new Set(prev).add(readerType));
  };

  return (
    <Container style={globalStyles.container}>
      <ProgressBar
        currentStep={getCurrentStep()}
        totalSteps={getTotalSteps()}
      />
      {/* 테마 토글 버튼 */}
      {/* <ThemeToggle position="fixed" /> */}

      <Title
        style={{
          ...globalStyles.heading,
          color: getColor("primary", "200"),
        }}
      >
        타로를 봐줄 캐릭터를 선택하세요
      </Title>

      <Description
        style={{
          ...globalStyles.body,
          color: getColor("primary", "300"),
        }}
      >
        어떤 스타일의 해석을 받고 싶으신가요?
      </Description>

      {/* 로딩 상태 */}
      {isLoading && (
        <LoadingText style={{ color: getColor("primary", "300") }}>
          리더 정보를 불러오는 중...
        </LoadingText>
      )}

      {/* 에러 상태 */}
      {error && (
        <ErrorText style={{ color: getColor("error", "400") }}>
          리더 정보를 불러오는데 실패했습니다: {error}
        </ErrorText>
      )}

      {/* 리더 목록 */}
      {!isLoading && !error && (
        <CharacterGrid>
          {readers.map((reader) => (
            <SelectableButton
              key={reader.type}
              onClick={() => handleReaderSelect(reader)}
              isSelected={selectedReader?.type === reader.type}
            >
              <CharacterAvatar>
                {/* TTS 로딩 또는 재생 중일 때 표시할 인디케이터 */}
                {(ttsLoading || isPlaying) &&
                  selectedReader?.type === reader.type && (
                    <TTSIndicator>🔊</TTSIndicator>
                  )}

                {/* 선택된 리더이고 TTS 재생 중일 때만 비디오 표시 */}
                {selectedReader?.type === reader.type &&
                 isPlaying &&
                 reader.videoUrl ? (
                  <ReaderVideo
                    videoUrl={reader.videoUrl}
                    readerName={reader.name}
                    readerType={reader.type}
                    autoPlay={true}
                    isPlaying={isPlaying}
                    size="medium"
                    shape="rectangle"
                    showFallback={true}
                    fallbackImageUrl={reader.imageUrl}
                  />
                ) : !imageErrors.has(reader.type) ? (
                  <CharacterImage
                    src={reader.imageUrl}
                    alt={reader.name}
                    onError={() => handleImageError(reader.type)}
                  />
                ) : (
                  <FallbackText
                    style={{
                      background: `linear-gradient(135deg, ${getColor(
                        "accent",
                        "400"
                      )} 0%, ${getColor("accent", "600")} 100%)`,
                    }}
                  >
                    {reader.type}
                  </FallbackText>
                )}
              </CharacterAvatar>

              <CharacterInfo>
                <CharacterTitle
                  style={{
                    ...globalStyles.subheading,
                    color: getColor("accent", "300"),
                  }}
                >
                  {reader.name}
                </CharacterTitle>

                <CharacterDescription
                  style={{
                    ...globalStyles.body,
                    color: getColor("primary", "400"),
                  }}
                >
                  {reader.description}
                </CharacterDescription>
              </CharacterInfo>
            </SelectableButton>
          ))}
        </CharacterGrid>
      )}

      <ButtonGroup gap="large">
        <Button variant="secondary" size="large" onClick={handlePrev}>
          이전
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={handleNext}
          disabled={!selectedReader}
        >
          다음
        </Button>
      </ButtonGroup>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 600px;
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  max-width: 1000px;
  width: 100%;
  margin-bottom: 40px;
`;

const CharacterAvatar = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
`;

const CharacterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const FallbackText = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-primary-900);
`;

const CharacterInfo = styled.div`
  flex: 1;
`;

const CharacterTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 15px;
`;

const CharacterDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
`;

const TTSIndicator = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 237, 77, 0.9);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite alternate;

  @keyframes pulse {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1.1);
    }
  }
`;

const LoadingText = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

const ErrorText = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 16px;
`;

export default Onboarding2Page;
