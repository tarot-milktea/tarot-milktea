package org.com.taro.service.ai;

import java.util.List;
import java.util.ArrayList;

import org.com.taro.dto.SubmitRequest;
import org.com.taro.dto.ChatMessage;
import org.com.taro.dto.ImageGenerationResult;
import org.com.taro.entity.TaroSession;
import org.com.taro.entity.DrawnCard;
import org.com.taro.entity.TaroReading;
import org.com.taro.entity.TaroCardEntity;
import org.com.taro.repository.*;
import org.com.taro.service.SSEManager;
import org.com.taro.constants.ValidationConstants;
import org.com.taro.constants.StatusConstants;
import org.com.taro.service.ReferenceDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TaroAiService {

    private static final Logger logger = LoggerFactory.getLogger(TaroAiService.class);

    @Autowired
    private OpenAIClient openAIClient;

    @Autowired
    private GeminiImageClient geminiImageClient;

    @Autowired
    private MockAiService mockAiService;

    @Value("${ai.mock.enabled:false}")
    private boolean mockEnabled;

    @Autowired
    private PromptService promptService;

    @Autowired
    private ReaderPersonaService readerPersonaService;

    @Autowired
    private SSEManager sseManager;

    @Autowired
    private TaroSessionRepository taroSessionRepository;

    @Autowired
    private TaroReadingRepository taroReadingRepository;

    @Autowired
    private DrawnCardRepository drawnCardRepository;

    @Autowired
    private TaroCardRepository taroCardRepository;

    @Autowired
    private ReferenceDataService referenceDataService;

    /**
     * 순차적 AI 처리 메인 메서드 과거 -> 현재 -> 미래 -> 총평 -> 이미지 순서로 처리
     */
    @Async("taroTaskExecutor")
    @Transactional
    public void processSequentially(String sessionId, SubmitRequest request) {
        logger.info("순차적 AI 처리 시작 - 세션: {}, 스레드: {}", sessionId, Thread.currentThread().getName());

        try {
            // 세션 정보 조회
            TaroSession session = taroSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

            TaroReading taroReading = taroReadingRepository.findBySessionId(sessionId).stream()
                    .findFirst().orElseThrow(() -> new RuntimeException(
                            "TaroReading not found for session: " + sessionId));

            // 뽑은 카드 3장 조회
            List<DrawnCard> drawnCards =
                    drawnCardRepository.findByReadingIdOrderByPosition(taroReading.getId());
            if (drawnCards.size() != 3) {
                throw new RuntimeException("Expected 3 cards, but found " + drawnCards.size());
            }

            // 대화 컨텍스트 초기화
            List<ChatMessage> conversationHistory = new ArrayList<>();

            // 시스템 프롬프트 추가 (리더 타입별)
            String systemPrompt = readerPersonaService.getSystemPrompt(request.getReaderType());
            conversationHistory.add(new ChatMessage("system", systemPrompt));

            // 1. 과거 카드 해석 (position = 1)
            String pastInterpretation = interpretCardWithConversation(sessionId, drawnCards.get(0),
                    request, ValidationConstants.TIMEFRAME_PAST, conversationHistory);
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.PAST_COMPLETED);
            sseManager.sendCardInterpretedEvent(sessionId, 1, pastInterpretation);

            // 2. 현재 카드 해석 (position = 2) - 과거 컨텍스트 포함
            String presentInterpretation = interpretCardWithConversation(sessionId,
                    drawnCards.get(1), request, ValidationConstants.TIMEFRAME_PRESENT, conversationHistory);
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.PRESENT_COMPLETED);
            sseManager.sendCardInterpretedEvent(sessionId, 2, presentInterpretation);

            // 3. 미래 카드 해석 (position = 3) - 과거/현재 컨텍스트 포함
            String futureInterpretation = interpretCardWithConversation(sessionId,
                    drawnCards.get(2), request, ValidationConstants.TIMEFRAME_FUTURE, conversationHistory);
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.FUTURE_COMPLETED);
            sseManager.sendCardInterpretedEvent(sessionId, 3, futureInterpretation);

            // 데이터베이스에 각 해석 저장
            taroReading.setPastInterpretation(pastInterpretation);
            taroReading.setPresentInterpretation(presentInterpretation);
            taroReading.setFutureInterpretation(futureInterpretation);
            taroReadingRepository.save(taroReading);

            // 4. 총평 생성
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.SUMMARY_PROCESSING);
            sseManager.sendStatusEvent(sessionId, StatusConstants.STATUS_SUMMARY_PROCESSING, "총평을 생성하고 있습니다...", 80);

            String summary = generateSummary(pastInterpretation, presentInterpretation,
                    futureInterpretation, request);
            taroReading.setInterpretation(summary);

            // 5. 총평을 기반으로 점수 계산
            Integer fortuneScore = calculateFortuneScore(summary);
            taroReading.setFortuneScore(fortuneScore);

            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.SUMMARY_COMPLETED);
            sseManager.sendSummaryEvent(sessionId, summary);

            // 6. 이미지 생성
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.IMAGE_PROCESSING);
            sseManager.sendStatusEvent(sessionId, StatusConstants.STATUS_IMAGE_PROCESSING, "조언 이미지를 생성하고 있습니다...", 90);

            ImageGenerationResult imageResult = generateAdviceImage(summary, request, sessionId);
            taroReading.setResultImageUrl(imageResult.getImageUrl());
            taroReading.setResultImageText(imageResult.getTextDescription());
            taroReadingRepository.save(taroReading);

            // 7. 완료 처리
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.COMPLETED);
            session.setStatus(TaroSession.SessionStatus.COMPLETED);
            taroSessionRepository.save(session);

            sseManager.sendImageEvent(sessionId, imageResult.getImageUrl());
            sseManager.sendCompletedEvent(sessionId);

            logger.info("순차적 AI 처리 완료 - 세션: {}", sessionId);

        } catch (Exception e) {
            logger.error("순차적 AI 처리 실패 - 세션: {}, 에러: {}", sessionId, e.getMessage(), e);
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.FAILED);
            sseManager.sendErrorEvent(sessionId, "타로 해석 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 대화 컨텍스트를 활용한 카드 해석
     */
    private String interpretCardWithConversation(String sessionId, DrawnCard drawnCard,
            SubmitRequest request, String timeFrame, List<ChatMessage> conversationHistory) {
        try {
            updateProcessingStatus(sessionId, getProcessingStatusForTimeFrame(timeFrame, true));
            sseManager.sendStatusEvent(sessionId, timeFrame.toUpperCase() + "_PROCESSING",
                    timeFrame + " 카드를 해석하고 있습니다...", getProgressForTimeFrame(timeFrame));

            // 이전 해석이 있는지 확인 (과거가 아닌 경우)
            boolean hasPreviousContext = !timeFrame.equals(ValidationConstants.TIMEFRAME_PAST);

            // 리더 타입별 카드 프롬프트 생성
            String cardPrompt =
                    buildCardPromptWithContext(drawnCard, request, timeFrame, hasPreviousContext);

            // 대화 기록에 사용자 질문 추가
            conversationHistory.add(new ChatMessage("user", cardPrompt));

            // AI API 호출 (대화 컨텍스트 포함) - Mock 모드 지원
            String interpretation;
            if (mockEnabled) {
                logger.info("🎭 Mock 모드: {} 카드 해석 생성 중...", timeFrame);
                interpretation = mockAiService.interpretWithConversation(conversationHistory);
            } else {
                interpretation = openAIClient.interpretWithConversation(conversationHistory);
            }

            // 대화 기록에 AI 응답 추가 (다음 카드 해석을 위해)
            conversationHistory.add(new ChatMessage("assistant", interpretation));

            // 해석 완료 (DrawnCard에는 저장하지 않음)
            drawnCardRepository.save(drawnCard);

            logger.info("대화 기반 카드 해석 완료 - 세션: {}, 시점: {}, 카드: {}", sessionId, timeFrame,
                    drawnCard.getCardId());
            return interpretation;

        } catch (Exception e) {
            logger.error("대화 기반 카드 해석 실패 - 세션: {}, 시점: {}, 에러: {}", sessionId, timeFrame,
                    e.getMessage(), e);
            String fallbackInterpretation =
                    "이 " + timeFrame + " 카드 해석 중 문제가 발생했지만, 우주는 여전히 당신을 앞으로 안내합니다.";
            // fallback 처리 완료 (DrawnCard에는 저장하지 않음)
            drawnCardRepository.save(drawnCard);

            // 실패한 경우에도 대화 기록에 추가 (일관성 유지)
            conversationHistory.add(new ChatMessage("assistant", fallbackInterpretation));

            return fallbackInterpretation;
        }
    }

    /**
     * 컨텍스트를 고려한 카드 프롬프트 생성
     */
    private String buildCardPromptWithContext(DrawnCard drawnCard, SubmitRequest request,
            String timeFrame, boolean hasPreviousContext) {
        StringBuilder prompt = new StringBuilder();

        // 기본 상담 정보
        prompt.append("상담 정보:\n");
        prompt.append("- 카테고리: ").append(referenceDataService.getCategoryName(request.getCategoryCode())).append("\n");
        prompt.append("- 주제: ").append(referenceDataService.getTopicName(request.getTopicCode())).append("\n");
        prompt.append("- 질문: \"").append(request.getQuestionText()).append("\"\n\n");

        // 카드 정보 추가
        try {
            TaroCardEntity cardEntity =
                    taroCardRepository.findById(Long.valueOf(drawnCard.getCardId())).orElseThrow(
                            () -> new RuntimeException("Card not found: " + drawnCard.getCardId()));

            String orientation =
                    drawnCard.getOrientation() == DrawnCard.Orientation.upright ? "정방향" : "역방향";
            prompt.append("해석할 카드:\n");
            prompt.append("- 카드명: ").append(cardEntity.getNameKo()).append(" (")
                    .append(cardEntity.getNameEn()).append(")\n");
            prompt.append("- 방향: ").append(orientation).append("\n");
            prompt.append("- 시점: ").append(timeFrame).append("\n");

            String meaning = drawnCard.getOrientation() == DrawnCard.Orientation.upright
                    ? cardEntity.getMeaningUpright()
                    : cardEntity.getMeaningReversed();
            prompt.append("- 기본 의미: ").append(meaning).append("\n\n");

            // 상징적 해석 가이드 추가
            String symbolicPrompt = readerPersonaService.getSymbolicInterpretationPrompt(
                    request.getReaderType(), timeFrame, cardEntity.getNameKo(), orientation);
            prompt.append("상징적 해석 가이드:\n").append(symbolicPrompt).append("\n\n");

        } catch (Exception e) {
            prompt.append("카드 정보: ").append(timeFrame).append(" 카드\n\n");
            // 카드 정보를 가져올 수 없는 경우 기본 상징적 프롬프트 추가
            String fallbackSymbolicPrompt = readerPersonaService.getSymbolicInterpretationPrompt(
                    request.getReaderType(), timeFrame, "알 수 없는 카드", "정방향");
            prompt.append("상징적 해석 가이드:\n").append(fallbackSymbolicPrompt).append("\n\n");
        }

        // 리더 타입별 특화 프롬프트 추가
        String readerSpecificPrompt = readerPersonaService.getCardPrompt(request.getReaderType(),
                timeFrame, hasPreviousContext);
        prompt.append(readerSpecificPrompt);

        // 리더 타입별 구어체 응답 형식 지시
        String responseFormat = getResponseFormatInstruction(request.getReaderType());
        prompt.append("\n\n").append(responseFormat);

        return prompt.toString();
    }

    /**
     * 리더 타입별 응답 형식 지시사항 생성
     */
    private String getResponseFormatInstruction(String readerType) {
        if (!referenceDataService.isValidReaderType(readerType)) {
            return "위 상징적 관점을 바탕으로, 친근한 구어체로 5줄 이내로 자연스럽게 이야기해주세요. " +
                   "블릿포인트나 부제목 없이 마치 친구에게 말하듯 편안하게 답변해주세요.";
        }

        switch (readerType.toUpperCase()) {
            case "F": // 감성형
                return "위 상징적 관점을 바탕으로, 따뜻하고 공감하는 구어체로 답변해주세요. " +
                       "'~해요', '~네요', '~거든요' 같은 부드러운 말투로 5줄 이내로 이야기하세요. " +
                       "마치 오래된 친구가 위로하듯 자연스럽게, 블릿포인트나 구조화된 형식 없이 답변해주세요.";
            case "T": // 논리형
                return "위 상징적 관점을 바탕으로, 명확하고 실용적인 구어체로 답변해주세요. " +
                       "'~입니다', '~해보세요', '~것 같아요' 같은 현실적인 말투로 5줄 이내로 설명하세요. " +
                       "핵심을 짚어주되 친근하게, 블릿포인트나 구조화된 형식 없이 자연스럽게 답변해주세요.";
            case "FT": // 균형형
                return "위 상징적 관점을 바탕으로, 지혜롭고 균형잡힌 구어체로 답변해주세요. " +
                       "'~죠', '~거예요', '~인 것 같아요' 같은 편안한 말투로 5줄 이내로 조언하세요. " +
                       "감정과 현실을 조화롭게 엮어서, 블릿포인트나 구조화된 형식 없이 자연스럽게 답변해주세요.";
            default:
                return "위 상징적 관점을 바탕으로, 친근한 구어체로 5줄 이내로 자연스럽게 이야기해주세요. " +
                       "블릿포인트나 부제목 없이 마치 친구에게 말하듯 편안하게 답변해주세요.";
        }
    }

    // 헬퍼 메서드들은 ValidationConstants로 이동됨 - getCategoryName(), getTopicName() 사용

    /**
     * 개별 카드 해석 (Deprecated - 대화 컨텍스트 없이)
     */
    @Deprecated
    private String interpretCard(String sessionId, DrawnCard drawnCard, SubmitRequest request,
            String timeFrame) {
        try {
            updateProcessingStatus(sessionId, getProcessingStatusForTimeFrame(timeFrame, true));
            sseManager.sendStatusEvent(sessionId, timeFrame.toUpperCase() + "_PROCESSING",
                    timeFrame + " 카드를 해석하고 있습니다...", getProgressForTimeFrame(timeFrame));

            String prompt = promptService.createCardPrompt(drawnCard, request, timeFrame);
            String interpretation = openAIClient.interpretCardText(prompt);

            // 해석 완료 (DrawnCard에는 저장하지 않음)
            drawnCardRepository.save(drawnCard);

            logger.info("카드 해석 완료 - 세션: {}, 시점: {}, 카드: {}", sessionId, timeFrame,
                    drawnCard.getCardId());
            return interpretation;

        } catch (Exception e) {
            logger.error("카드 해석 실패 - 세션: {}, 시점: {}, 에러: {}", sessionId, timeFrame, e.getMessage(),
                    e);
            String fallbackInterpretation =
                    "이 " + timeFrame + " 카드 해석 중 문제가 발생했지만, 우주는 여전히 당신을 앞으로 안내합니다.";
            // fallback 처리 완료 (DrawnCard에는 저장하지 않음)
            drawnCardRepository.save(drawnCard);
            return fallbackInterpretation;
        }
    }

    /**
     * 총평 생성
     */
    private String generateSummary(String past, String present, String future,
            SubmitRequest request) {
        try {
            String prompt = promptService.createSummaryPrompt(past, present, future, request);
            if (mockEnabled) {
                logger.info("🎭 Mock 모드: 총평 생성 중...");
                return mockAiService.generateSummaryText(prompt);
            } else {
                return openAIClient.generateSummaryText(prompt);
            }
        } catch (Exception e) {
            logger.error("총평 생성 실패: {}", e.getMessage(), e);
            return "세 카드가 합쳐져 당신의 앞날에 대한 희망과 안내의 메시지를 전합니다. 그들이 주는 지혜를 신뢰하세요.";
        }
    }

    /**
     * Generate advice image using Gemini AI
     */
    private ImageGenerationResult generateAdviceImage(String summary, SubmitRequest request,
            String sessionId) {
        try {
            String imagePrompt = promptService.createImagePrompt(summary, request);
            if (mockEnabled) {
                logger.info("🎭 Mock 모드: 조언 이미지 생성 중...");
                return mockAiService.generateImage(imagePrompt, sessionId);
            } else {
                return geminiImageClient.generateImage(imagePrompt, sessionId);
            }
        } catch (Exception e) {
            logger.error("Image generation failed: {}", e.getMessage(), e);
            return new ImageGenerationResult("https://example.com/default-advice-image.jpg", "");
        }
    }

    /**
     * Calculate fortune score based on overall summary
     */
    private Integer calculateFortuneScore(String summary) {
        if (summary == null || summary.trim().isEmpty()) {
            return 85; // 기본 점수 (80-100 범위의 중간값)
        }

        int score = 85; // 기본 점수 (80-100 범위의 중간값)
        String summaryLower = summary.toLowerCase();

        // 강한 긍정 지표 (+15점)
        if (summaryLower.contains("매우 좋") || summaryLower.contains("훌륭")
                || summaryLower.contains("최고") || summaryLower.contains("완벽")) {
            score += 15;
        }
        // 일반 긍정 지표 (+10점)
        else if (summaryLower.contains("성공") || summaryLower.contains("좋")
                || summaryLower.contains("긍정") || summaryLower.contains("성장")
                || summaryLower.contains("발전") || summaryLower.contains("번영")) {
            score += 10;
        }
        // 약한 긍정 지표 (+5점)
        else if (summaryLower.contains("사랑") || summaryLower.contains("조화")
                || summaryLower.contains("평화") || summaryLower.contains("기쁨")
                || summaryLower.contains("희망") || summaryLower.contains("안정")) {
            score += 5;
        }

        // 강한 부정 지표 (-5점, 최소 80점 보장)
        if (summaryLower.contains("매우 어려") || summaryLower.contains("심각")
                || summaryLower.contains("위험") || summaryLower.contains("절망")) {
            score -= 5;
        }
        // 일반 부정 지표 (-3점)
        else if (summaryLower.contains("도전") || summaryLower.contains("어려움")
                || summaryLower.contains("고민") || summaryLower.contains("장애물")
                || summaryLower.contains("문제") || summaryLower.contains("갈등")) {
            score -= 3;
        }
        // 약한 부정 지표 (-2점)
        else if (summaryLower.contains("주의") || summaryLower.contains("신중")
                || summaryLower.contains("고려") || summaryLower.contains("점검")) {
            score -= 2;
        }

        // 전환/변화 키워드 (중립적이지만 약간 긍정적 +3점)
        if (summaryLower.contains("변화") || summaryLower.contains("전환")
                || summaryLower.contains("새로운") || summaryLower.contains("기회")) {
            score += 3;
        }

        // 점수가 80-100 범위 내에 있도록 보장
        return Math.max(80, Math.min(100, score));
    }

    /**
     * 처리 상태 업데이트
     */
    private void updateProcessingStatus(String sessionId, TaroSession.ProcessingStatus status) {
        TaroSession session = taroSessionRepository.findById(sessionId).orElse(null);
        if (session != null) {
            session.setProcessingStatus(status);
            taroSessionRepository.save(session);
        }
    }

    /**
     * 시간대별 처리 상태 반환
     */
    private TaroSession.ProcessingStatus getProcessingStatusForTimeFrame(String timeFrame,
            boolean isProcessing) {
        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PAST:
                return isProcessing ? TaroSession.ProcessingStatus.PAST_PROCESSING
                        : TaroSession.ProcessingStatus.PAST_COMPLETED;
            case ValidationConstants.TIMEFRAME_PRESENT:
                return isProcessing ? TaroSession.ProcessingStatus.PRESENT_PROCESSING
                        : TaroSession.ProcessingStatus.PRESENT_COMPLETED;
            case ValidationConstants.TIMEFRAME_FUTURE:
                return isProcessing ? TaroSession.ProcessingStatus.FUTURE_PROCESSING
                        : TaroSession.ProcessingStatus.FUTURE_COMPLETED;
            default:
                return TaroSession.ProcessingStatus.FAILED;
        }
    }

    /**
     * 시간대별 진행률 반환
     */
    private Integer getProgressForTimeFrame(String timeFrame) {
        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PAST:
                return 20;
            case ValidationConstants.TIMEFRAME_PRESENT:
                return 40;
            case ValidationConstants.TIMEFRAME_FUTURE:
                return 60;
            default:
                return 0;
        }
    }

}
