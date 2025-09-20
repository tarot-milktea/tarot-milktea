package org.com.taro.service.ai;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;

import org.com.taro.dto.SubmitRequest;
import org.com.taro.dto.ChatMessage;
import org.com.taro.dto.ImageGenerationResult;
import org.com.taro.entity.TaroSession;
import org.com.taro.entity.DrawnCard;
import org.com.taro.entity.TaroReading;
import org.com.taro.entity.TaroCardEntity;
import org.com.taro.repository.*;
import org.com.taro.service.SSEManager;
import org.com.taro.service.ai.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
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

    /**
     * 순차적 AI 처리 메인 메서드
     * 과거 -> 현재 -> 미래 -> 총평 -> 이미지 순서로 처리
     */
    @Async("taroTaskExecutor")
    @Transactional
    public void processSequentially(String sessionId, SubmitRequest request) {
        logger.info("순차적 AI 처리 시작 - 세션: {}, 스레드: {}", sessionId, Thread.currentThread().getName());

        try {
            // 세션 정보 조회
            TaroSession session = taroSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

            TaroReading taroReading = taroReadingRepository.findBySessionId(sessionId)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("TaroReading not found for session: " + sessionId));

            // 뽑은 카드 3장 조회
            List<DrawnCard> drawnCards = drawnCardRepository.findByReadingIdOrderByPosition(taroReading.getId());
            if (drawnCards.size() != 3) {
                throw new RuntimeException("Expected 3 cards, but found " + drawnCards.size());
            }

            // 대화 컨텍스트 초기화
            List<ChatMessage> conversationHistory = new ArrayList<>();

            // 시스템 프롬프트 추가 (리더 타입별)
            String systemPrompt = readerPersonaService.getSystemPrompt(request.getReaderType());
            conversationHistory.add(new ChatMessage("system", systemPrompt));

            // 1. 과거 카드 해석 (position = 1)
            String pastInterpretation = interpretCardWithConversation(sessionId, drawnCards.get(0), request, "과거", conversationHistory);
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.PAST_COMPLETED);
            sseManager.sendCardInterpretedEvent(sessionId, 1, pastInterpretation);

            // 2. 현재 카드 해석 (position = 2) - 과거 컨텍스트 포함
            String presentInterpretation = interpretCardWithConversation(sessionId, drawnCards.get(1), request, "현재", conversationHistory);
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.PRESENT_COMPLETED);
            sseManager.sendCardInterpretedEvent(sessionId, 2, presentInterpretation);

            // 3. 미래 카드 해석 (position = 3) - 과거/현재 컨텍스트 포함
            String futureInterpretation = interpretCardWithConversation(sessionId, drawnCards.get(2), request, "미래", conversationHistory);
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.FUTURE_COMPLETED);
            sseManager.sendCardInterpretedEvent(sessionId, 3, futureInterpretation);

            // 데이터베이스에 각 해석 저장
            taroReading.setPastInterpretation(pastInterpretation);
            taroReading.setPresentInterpretation(presentInterpretation);
            taroReading.setFutureInterpretation(futureInterpretation);
            taroReadingRepository.save(taroReading);

            // 4. 총평 생성
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.SUMMARY_PROCESSING);
            sseManager.sendStatusEvent(sessionId, "SUMMARY_PROCESSING", "총평을 생성하고 있습니다...", 80);

            String summary = generateSummary(pastInterpretation, presentInterpretation, futureInterpretation, request);
            taroReading.setInterpretation(summary);

            // 5. 총평을 기반으로 점수 계산
            Integer fortuneScore = calculateFortuneScore(summary);
            taroReading.setFortuneScore(fortuneScore);

            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.SUMMARY_COMPLETED);
            sseManager.sendSummaryEvent(sessionId, summary);

            // 6. 이미지 생성
            updateProcessingStatus(sessionId, TaroSession.ProcessingStatus.IMAGE_PROCESSING);
            sseManager.sendStatusEvent(sessionId, "IMAGE_PROCESSING", "조언 이미지를 생성하고 있습니다...", 90);

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
    private String interpretCardWithConversation(String sessionId, DrawnCard drawnCard, SubmitRequest request,
                                               String timeFrame, List<ChatMessage> conversationHistory) {
        try {
            updateProcessingStatus(sessionId, getProcessingStatusForTimeFrame(timeFrame, true));
            sseManager.sendStatusEvent(sessionId, timeFrame.toUpperCase() + "_PROCESSING",
                timeFrame + " 카드를 해석하고 있습니다...", getProgressForTimeFrame(timeFrame));

            // 이전 해석이 있는지 확인 (과거가 아닌 경우)
            boolean hasPreviousContext = !timeFrame.equals("과거");

            // 리더 타입별 카드 프롬프트 생성
            String cardPrompt = buildCardPromptWithContext(drawnCard, request, timeFrame, hasPreviousContext);

            // 대화 기록에 사용자 질문 추가
            conversationHistory.add(new ChatMessage("user", cardPrompt));

            // OpenAI API 호출 (대화 컨텍스트 포함)
            String interpretation = openAIClient.interpretWithConversation(conversationHistory);

            // 대화 기록에 AI 응답 추가 (다음 카드 해석을 위해)
            conversationHistory.add(new ChatMessage("assistant", interpretation));

            // 해석 완료 (DrawnCard에는 저장하지 않음)
            drawnCardRepository.save(drawnCard);

            logger.info("대화 기반 카드 해석 완료 - 세션: {}, 시점: {}, 카드: {}", sessionId, timeFrame, drawnCard.getCardId());
            return interpretation;

        } catch (Exception e) {
            logger.error("대화 기반 카드 해석 실패 - 세션: {}, 시점: {}, 에러: {}", sessionId, timeFrame, e.getMessage(), e);
            String fallbackInterpretation = "이 " + timeFrame + " 카드 해석 중 문제가 발생했지만, 우주는 여전히 당신을 앞으로 안내합니다.";
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
        prompt.append("- 카테고리: ").append(getCategoryName(request.getCategoryCode())).append("\n");
        prompt.append("- 주제: ").append(getTopicName(request.getTopicCode())).append("\n");
        prompt.append("- 질문: \"").append(request.getQuestionText()).append("\"\n\n");

        // 카드 정보 추가
        try {
            TaroCardEntity cardEntity = taroCardRepository.findById(Long.valueOf(drawnCard.getCardId()))
                .orElseThrow(() -> new RuntimeException("Card not found: " + drawnCard.getCardId()));

            String orientation = drawnCard.getOrientation() == DrawnCard.Orientation.upright ? "정방향" : "역방향";
            prompt.append("해석할 카드:\n");
            prompt.append("- 카드명: ").append(cardEntity.getNameKo()).append(" (").append(cardEntity.getNameEn()).append(")\n");
            prompt.append("- 방향: ").append(orientation).append("\n");
            prompt.append("- 시점: ").append(timeFrame).append("\n");

            String meaning = drawnCard.getOrientation() == DrawnCard.Orientation.upright ?
                cardEntity.getMeaningUpright() : cardEntity.getMeaningReversed();
            prompt.append("- 기본 의미: ").append(meaning).append("\n\n");

        } catch (Exception e) {
            prompt.append("카드 정보: ").append(timeFrame).append(" 카드\n\n");
        }

        // 리더 타입별 특화 프롬프트 추가
        String readerSpecificPrompt = readerPersonaService.getCardPrompt(
            request.getReaderType(), timeFrame, hasPreviousContext);
        prompt.append(readerSpecificPrompt);

        return prompt.toString();
    }

    // 헬퍼 메서드들 (기존 PromptService에서 가져온 것들)
    private String getCategoryName(String categoryCode) {
        switch (categoryCode) {
            case "LOVE": return "연애";
            case "JOB": return "취업";
            case "MONEY": return "금전";
            default: return categoryCode;
        }
    }

    private String getTopicName(String topicCode) {
        switch (topicCode) {
            case "REUNION": return "재회";
            case "NEW_LOVE": return "새로운 인연";
            case "CURRENT_RELATIONSHIP": return "현재 연애";
            case "MARRIAGE": return "결혼";
            case "BREAKUP": return "이별";
            case "JOB_CHANGE": return "이직";
            case "PROMOTION": return "승진";
            case "NEW_JOB": return "취업";
            case "CAREER_PATH": return "커리어";
            case "WORKPLACE": return "직장생활";
            case "INVESTMENT": return "투자";
            case "SAVINGS": return "저축";
            case "DEBT": return "부채";
            case "INCOME": return "수입";
            case "BUSINESS": return "사업";
            default: return topicCode;
        }
    }

    /**
     * 개별 카드 해석 (Deprecated - 대화 컨텍스트 없이)
     */
    @Deprecated
    private String interpretCard(String sessionId, DrawnCard drawnCard, SubmitRequest request, String timeFrame) {
        try {
            updateProcessingStatus(sessionId, getProcessingStatusForTimeFrame(timeFrame, true));
            sseManager.sendStatusEvent(sessionId, timeFrame.toUpperCase() + "_PROCESSING",
                timeFrame + " 카드를 해석하고 있습니다...", getProgressForTimeFrame(timeFrame));

            String prompt = promptService.createCardPrompt(drawnCard, request, timeFrame);
            String interpretation = openAIClient.interpretCardText(prompt);

            // 해석 완료 (DrawnCard에는 저장하지 않음)
            drawnCardRepository.save(drawnCard);

            logger.info("카드 해석 완료 - 세션: {}, 시점: {}, 카드: {}", sessionId, timeFrame, drawnCard.getCardId());
            return interpretation;

        } catch (Exception e) {
            logger.error("카드 해석 실패 - 세션: {}, 시점: {}, 에러: {}", sessionId, timeFrame, e.getMessage(), e);
            String fallbackInterpretation = "이 " + timeFrame + " 카드 해석 중 문제가 발생했지만, 우주는 여전히 당신을 앞으로 안내합니다.";
            // fallback 처리 완료 (DrawnCard에는 저장하지 않음)
            drawnCardRepository.save(drawnCard);
            return fallbackInterpretation;
        }
    }

    /**
     * 총평 생성
     */
    private String generateSummary(String past, String present, String future, SubmitRequest request) {
        try {
            String prompt = promptService.createSummaryPrompt(past, present, future, request);
            return openAIClient.generateSummaryText(prompt);
        } catch (Exception e) {
            logger.error("총평 생성 실패: {}", e.getMessage(), e);
            return "세 카드가 합쳐져 당신의 앞날에 대한 희망과 안내의 메시지를 전합니다. 그들이 주는 지혜를 신뢰하세요.";
        }
    }

    /**
     * Generate advice image using Gemini AI
     */
    private ImageGenerationResult generateAdviceImage(String summary, SubmitRequest request, String sessionId) {
        try {
            String imagePrompt = promptService.createImagePrompt(summary, request);
            return geminiImageClient.generateImage(imagePrompt, sessionId);
        } catch (Exception e) {
            logger.error("Gemini image generation failed: {}", e.getMessage(), e);
            return new ImageGenerationResult("https://example.com/default-advice-image.jpg", "");
        }
    }

    /**
     * Calculate fortune score based on overall summary
     */
    private Integer calculateFortuneScore(String summary) {
        if (summary == null || summary.trim().isEmpty()) {
            return 50; // 기본 점수
        }

        int score = 50; // 기본 점수
        String summaryLower = summary.toLowerCase();

        // 강한 긍정 지표 (+25점)
        if (summaryLower.contains("매우 좋") || summaryLower.contains("훌륭") ||
            summaryLower.contains("최고") || summaryLower.contains("완벽")) {
            score += 25;
        }
        // 일반 긍정 지표 (+20점)
        else if (summaryLower.contains("성공") || summaryLower.contains("좋") ||
                summaryLower.contains("긍정") || summaryLower.contains("성장") ||
                summaryLower.contains("발전") || summaryLower.contains("번영")) {
            score += 20;
        }
        // 약한 긍정 지표 (+10점)
        else if (summaryLower.contains("사랑") || summaryLower.contains("조화") ||
                summaryLower.contains("평화") || summaryLower.contains("기쁨") ||
                summaryLower.contains("희망") || summaryLower.contains("안정")) {
            score += 10;
        }

        // 강한 부정 지표 (-25점)
        if (summaryLower.contains("매우 어려") || summaryLower.contains("심각") ||
            summaryLower.contains("위험") || summaryLower.contains("절망")) {
            score -= 25;
        }
        // 일반 부정 지표 (-15점)
        else if (summaryLower.contains("도전") || summaryLower.contains("어려움") ||
                summaryLower.contains("고민") || summaryLower.contains("장애물") ||
                summaryLower.contains("문제") || summaryLower.contains("갈등")) {
            score -= 15;
        }
        // 약한 부정 지표 (-5점)
        else if (summaryLower.contains("주의") || summaryLower.contains("신중") ||
                summaryLower.contains("고려") || summaryLower.contains("점검")) {
            score -= 5;
        }

        // 전환/변화 키워드 (중립적이지만 약간 긍정적 +5점)
        if (summaryLower.contains("변화") || summaryLower.contains("전환") ||
            summaryLower.contains("새로운") || summaryLower.contains("기회")) {
            score += 5;
        }

        // 점수가 유효 범위 내에 있도록 보장 (1-100)
        return Math.max(1, Math.min(100, score));
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
    private TaroSession.ProcessingStatus getProcessingStatusForTimeFrame(String timeFrame, boolean isProcessing) {
        switch (timeFrame) {
            case "과거":
                return isProcessing ? TaroSession.ProcessingStatus.PAST_PROCESSING : TaroSession.ProcessingStatus.PAST_COMPLETED;
            case "현재":
                return isProcessing ? TaroSession.ProcessingStatus.PRESENT_PROCESSING : TaroSession.ProcessingStatus.PRESENT_COMPLETED;
            case "미래":
                return isProcessing ? TaroSession.ProcessingStatus.FUTURE_PROCESSING : TaroSession.ProcessingStatus.FUTURE_COMPLETED;
            default:
                return TaroSession.ProcessingStatus.FAILED;
        }
    }

    /**
     * 시간대별 진행률 반환
     */
    private Integer getProgressForTimeFrame(String timeFrame) {
        switch (timeFrame) {
            case "과거": return 20;
            case "현재": return 40;
            case "미래": return 60;
            default: return 0;
        }
    }
    
}
