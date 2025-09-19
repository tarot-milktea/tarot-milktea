package org.com.taro.service.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.com.taro.config.OpenAIConfig;
import org.com.taro.dto.TaroResultResponse;
import org.com.taro.service.MockDataService;
import org.com.taro.dto.SubmitRequest;
import org.com.taro.entity.*;
import org.com.taro.repository.*;
import org.com.taro.constants.ValidationConstants;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OpenAIClient {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIClient.class);

    @Autowired
    private WebClient webClient;

    @Autowired
    private OpenAIConfig openAIConfig;

    @Autowired
    private MockDataService mockDataService;

    @Autowired
    private PromptService promptService;

    @Autowired
    private TaroReadingRepository taroReadingRepository;

    @Autowired
    private DrawnCardRepository drawnCardRepository;

    @Autowired
    private TaroCardRepository taroCardRepository;

    /**
     * AI를 통해 완전한 TaroResultResponse 생성 (메인 메서드)
     */
    public TaroResultResponse generateTaroResult(String sessionId, SubmitRequest request) {
        try {
            logger.info("AI 타로 결과 생성 시작 - 세션: {}", sessionId);
            
            // 1. 프롬프트 생성
            String prompt = promptService.createPrompt(request, sessionId);
            logger.debug("프롬프트 생성 완료 - 길이: {}", prompt.length());

            // 2. AI API 호출
            String aiResponse = getInterpretation(prompt);
            logger.debug("AI 응답 받음 - 길이: {}", aiResponse.length());

            // 3. JSON 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(aiResponse);

            // 4. 카드 정보는 DB에서 조회 (별도 서비스 메소드 필요)
            List<TaroResultResponse.DrawnCard> cards = getStoredCardsForResult(sessionId);
            
            // 5. TaroResultResponse 생성
            TaroResultResponse result = new TaroResultResponse(
                sessionId,
                cards,
                jsonNode.get("interpretation").asText(),
                jsonNode.get("readerMessage").asText(),
                jsonNode.get("fortuneScore").asInt(),
                "https://example.com/result-" + sessionId + ".jpg"
            );
            
            logger.info("AI 타로 결과 생성 성공 - 세션: {}", sessionId);
            return result;
            
        } catch (Exception e) {
            logger.error("AI 타로 결과 생성 실패 - 세션: {}, 에러: {}", sessionId, e.getMessage(), e);
            
            // 폴백: MockDataService 사용
            logger.info("폴백 모드로 결과 생성 - 세션: {}", sessionId);
            return mockDataService.generateTaroResultResponse(
                sessionId,
                request.getCategoryCode(),
                request.getTopicCode(),
                request.getQuestionText(),
                request.getReaderType()
            );
        }
    }

    /**
     * OpenAI API 호출하여 해석 텍스트 받기
     */
    @Retryable(
        value = {Exception.class}, 
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String getInterpretation(String prompt) {
        try {
            logger.debug("OpenAI API 호출 시작");
            
            // API 요청
            String response = webClient
                .post()
                .uri("/chat/completions")
                .bodyValue(buildRequestBody(prompt))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(openAIConfig.getTimeoutSeconds()))
                .block();
                
            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("OpenAI API 응답이 비어있습니다");
            }
            
            // JSON에서 content 부분 추출
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);
            
            // 응답 구조 검증
            if (!jsonNode.has("choices") || jsonNode.get("choices").size() == 0) {
                throw new RuntimeException("OpenAI API 응답 형식이 올바르지 않습니다");
            }
            
            String content = jsonNode.get("choices").get(0).get("message").get("content").asText();
            
            // 사용량 로깅
            if (jsonNode.has("usage")) {
                JsonNode usage = jsonNode.get("usage");
                logger.info("OpenAI API 사용량 - 총 토큰: {}, 프롬프트: {}, 완료: {}", 
                    usage.get("total_tokens").asInt(),
                    usage.get("prompt_tokens").asInt(),
                    usage.get("completion_tokens").asInt()
                );
            }
            
            logger.debug("OpenAI API 호출 성공 - 응답 길이: {}", content.length());
            return content;
            
        } catch (WebClientResponseException e) {
            logger.error("OpenAI API HTTP 에러 - Status: {}, Body: {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("OpenAI API 호출 실패: HTTP " + e.getStatusCode(), e);
            
        } catch (Exception e) {
            logger.error("OpenAI API 호출 중 예외 발생", e);
            throw new RuntimeException("OpenAI API 호출 실패: " + e.getMessage(), e);
        }
    }

    /**
     * OpenAI API 요청 바디 생성
     */
    private Object buildRequestBody(String prompt) {
        // 프롬프트를 시스템 메시지와 사용자 메시지로 분리
        String[] parts = prompt.split("\n\n", 2);
        String systemMessage = parts.length > 1 ? parts[0] : "당신은 전문 타로 리더입니다.";
        String userMessage = parts.length > 1 ? parts[1] : prompt;

        return Map.of(
            "model", openAIConfig.getModel(),
            "messages", List.of(
                Map.of("role", "system", "content", systemMessage),
                Map.of("role", "user", "content", userMessage)
            ),
            "max_tokens", openAIConfig.getMaxTokens(),
            "temperature", openAIConfig.getTemperature()
        );
    }

    /**
     * 세션의 저장된 카드를 TaroResultResponse용으로 조회
     */
    private List<TaroResultResponse.DrawnCard> getStoredCardsForResult(String sessionId) {
        try {
            // 세션에 해당하는 TaroReading 찾기
            TaroReading taroReading = taroReadingRepository.findBySessionId(sessionId)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("TaroReading not found for session: " + sessionId));

            // 저장된 drawn_cards 조회
            List<DrawnCard> drawnCards = drawnCardRepository.findByReadingIdOrderByPosition(taroReading.getId());

            // TaroResultResponse.DrawnCard로 변환
            return drawnCards.stream().map(drawnCard -> {
                TaroCardEntity cardEntity = taroCardRepository.findById(Long.valueOf(drawnCard.getCardId()))
                    .orElseThrow(() -> new RuntimeException("Card not found: " + drawnCard.getCardId()));

                String orientation = drawnCard.getOrientation() == DrawnCard.Orientation.upright ?
                    ValidationConstants.ORIENTATION_UPRIGHT : ValidationConstants.ORIENTATION_REVERSED;

                String meaning = drawnCard.getOrientation() == DrawnCard.Orientation.upright ?
                    cardEntity.getMeaningUpright() : cardEntity.getMeaningReversed();

                return new TaroResultResponse.DrawnCard(
                    drawnCard.getPosition(),
                    cardEntity.getId(),
                    cardEntity.getNameKo(),
                    cardEntity.getNameEn(),
                    orientation,
                    cardEntity.getImageUrl(),
                    meaning
                );
            }).collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve stored cards for session: " + sessionId, e);
        }
    }
}