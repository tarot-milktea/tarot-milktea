package org.com.taro.service.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.com.taro.config.OpenAIConfig;
import org.com.taro.dto.TaroResultResponse;
import org.com.taro.dto.ChatMessage;
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
     * Deprecated - Use interpretCardText() and generateSummaryText() instead
     * This was for processing all cards at once
     */

    /**
     * Interpret individual tarot card - returns plain text
     */
    @Retryable(
        value = {Exception.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String interpretCardText(String prompt) {
        try {
            logger.debug("OpenAI API 호출 시작");

            // API request
            String response = webClient
                .post()
                .uri("/chat/completions")
                .bodyValue(buildCardRequestBody(prompt))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(openAIConfig.getTimeoutSeconds()))
                .block();

            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("OpenAI API 응답이 비어있습니다");
            }

            // Extract content from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);

            // Validate response structure
            if (!jsonNode.has("choices") || jsonNode.get("choices").size() == 0) {
                throw new RuntimeException("OpenAI API 응답 형식이 올바르지 않습니다");
            }

            String content = jsonNode.get("choices").get(0).get("message").get("content").asText();

            // Log usage
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
     * Generate summary text from three card interpretations
     */
    @Retryable(
        value = {Exception.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String generateSummaryText(String prompt) {
        try {
            logger.debug("총평 생성 시작");

            String response = webClient
                .post()
                .uri("/chat/completions")
                .bodyValue(buildCardRequestBody(prompt))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(openAIConfig.getTimeoutSeconds()))
                .block();

            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("OpenAI API 응답이 비어있습니다");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);

            if (!jsonNode.has("choices") || jsonNode.get("choices").size() == 0) {
                throw new RuntimeException("OpenAI API 응답 형식이 올바르지 않습니다");
            }

            String content = jsonNode.get("choices").get(0).get("message").get("content").asText();
            logger.debug("총평 생성 성공 - 길이: {}", content.length());
            return content;

        } catch (Exception e) {
            logger.error("총평 생성 실패", e);
            throw new RuntimeException("총평 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * Generate advice image using DALL-E
     */
    public String generateAdviceImage(String prompt) {
        try {
            logger.debug("이미지 생성 시작");

            Map<String, Object> requestBody = Map.of(
                "model", "dall-e-3",
                "prompt", prompt,
                "n", 1,
                "size", "1024x1024",
                "quality", "standard"
            );

            String response = webClient
                .post()
                .uri("/images/generations")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(60)) // Longer timeout for image generation
                .block();

            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("DALL-E API 응답이 비어있습니다");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);

            if (!jsonNode.has("data") || jsonNode.get("data").size() == 0) {
                throw new RuntimeException("DALL-E API 응답 형식이 올바르지 않습니다");
            }

            String imageUrl = jsonNode.get("data").get(0).get("url").asText();
            logger.info("이미지 생성 성공 - URL: {}", imageUrl);
            return imageUrl;

        } catch (Exception e) {
            logger.error("이미지 생성 실패: {}", e.getMessage(), e);
            return "https://example.com/default-advice-image.jpg"; // Fallback
        }
    }

    /**
     * Build request body for card/summary API calls
     */
    private Object buildCardRequestBody(String prompt) {
        // Split prompt into system and user messages
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
     * New conversation-based interpretation with message history
     */
    @Retryable(
        value = {Exception.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String interpretWithConversation(List<ChatMessage> messages) {
        try {
            logger.debug("대화 기반 OpenAI API 호출 시작 - 메시지 수: {}", messages.size());

            String response = webClient
                .post()
                .uri("/chat/completions")
                .bodyValue(buildConversationRequestBody(messages))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(openAIConfig.getTimeoutSeconds()))
                .block();

            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("OpenAI API 응답이 비어있습니다");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);

            if (!jsonNode.has("choices") || jsonNode.get("choices").size() == 0) {
                throw new RuntimeException("OpenAI API 응답 형식이 올바르지 않습니다");
            }

            String content = jsonNode.get("choices").get(0).get("message").get("content").asText();

            // Log usage
            if (jsonNode.has("usage")) {
                JsonNode usage = jsonNode.get("usage");
                logger.info("대화 기반 OpenAI API 사용량 - 총 토큰: {}, 프롬프트: {}, 완료: {}",
                    usage.get("total_tokens").asInt(),
                    usage.get("prompt_tokens").asInt(),
                    usage.get("completion_tokens").asInt()
                );
            }

            logger.debug("대화 기반 OpenAI API 호출 성공 - 응답 길이: {}", content.length());
            return content;

        } catch (WebClientResponseException e) {
            logger.error("대화 기반 OpenAI API HTTP 에러 - Status: {}, Body: {}",
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("OpenAI API 호출 실패: HTTP " + e.getStatusCode(), e);

        } catch (Exception e) {
            logger.error("대화 기반 OpenAI API 호출 중 예외 발생", e);
            throw new RuntimeException("OpenAI API 호출 실패: " + e.getMessage(), e);
        }
    }

    /**
     * Build request body for conversation-based API calls
     */
    private Object buildConversationRequestBody(List<ChatMessage> messages) {
        // Convert ChatMessage objects to Map format for API
        List<Map<String, String>> apiMessages = messages.stream()
            .map(msg -> Map.of(
                "role", msg.getRole(),
                "content", msg.getContent()
            ))
            .toList();

        return Map.of(
            "model", openAIConfig.getModel(),
            "messages", apiMessages,
            "max_tokens", openAIConfig.getMaxTokens(),
            "temperature", openAIConfig.getTemperature()
        );
    }

    /**
     * Deprecated - This was for the old all-at-once processing approach
     */
}