package org.com.taro.service.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.com.taro.config.GeminiConfig;
import org.com.taro.dto.ImageGenerationResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.time.Duration;
import java.util.Base64;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GeminiImageClient {

    private static final Logger logger = LoggerFactory.getLogger(GeminiImageClient.class);

    @Autowired
    @Qualifier("geminiWebClient")
    private WebClient geminiWebClient;

    @Autowired
    private GeminiConfig geminiConfig;

    @Value("${media.base-url}")
    private String baseUrl;

    @Value("${media.images-path}")
    private String imagesPath;

    public ImageGenerationResult generateImage(String prompt, String sessionId) {
        try {
            logger.debug("Gemini image generation started");

            String response = geminiWebClient
                .post()
                .uri("/v1beta/models/{model}:generateContent?key={key}",
                     geminiConfig.getModel(), geminiConfig.getApiKey())
                .bodyValue(buildImageRequestBody(prompt))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(geminiConfig.getTimeoutSeconds()))
                .block();

            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("Gemini API response is empty");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);

            if (!jsonNode.has("candidates") || jsonNode.get("candidates").size() == 0) {
                throw new RuntimeException("Gemini API response format is invalid");
            }

            JsonNode candidate = jsonNode.get("candidates").get(0);
            if (!candidate.has("content") || !candidate.get("content").has("parts")) {
                throw new RuntimeException("No content parts in Gemini response");
            }

            JsonNode parts = candidate.get("content").get("parts");
            String imageUrl = null;
            String textDescription = null;

            // parts[0]: text 설명, parts[1]: inlineData (base64 이미지)
            if (parts.size() >= 2) {
                // 텍스트 설명 추출 (parts[0])
                if (parts.get(0).has("text")) {
                    textDescription = parts.get(0).get("text").asText();
                }

                // 이미지 데이터 추출 및 저장 (parts[1])
                if (parts.get(1).has("inlineData") && parts.get(1).get("inlineData").has("data")) {
                    String base64Data = parts.get(1).get("inlineData").get("data").asText();
                    imageUrl = saveBase64Image(base64Data, sessionId);
                }
            }

            if (imageUrl == null) {
                throw new RuntimeException("No image data found in Gemini response");
            }

            logger.info("Gemini image generation successful - URL: {}, Description: {}",
                imageUrl, textDescription != null ? textDescription.substring(0, Math.min(50, textDescription.length())) + "..." : "N/A");
            return new ImageGenerationResult(imageUrl, textDescription);

        } catch (WebClientResponseException e) {
            logger.error("Gemini API HTTP error - Status: {}, Body: {}",
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API call failed: HTTP " + e.getStatusCode(), e);

        } catch (Exception e) {
            logger.error("Gemini image generation failed", e);
            throw new RuntimeException("Gemini image generation failed: " + e.getMessage(), e);
        }
    }

    private Object buildImageRequestBody(String prompt) {
        return Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "responseModalities", List.of("Text", "Image")
            )
        );
    }

    private String saveBase64Image(String base64Data, String sessionId) throws IOException {
        try {
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            // 상대 경로를 절대 경로로 변환
            String absoluteImagesPath;
            if (Paths.get(imagesPath).isAbsolute()) {
                absoluteImagesPath = imagesPath;
            } else {
                // 프로젝트 루트 기준으로 상대 경로 처리
                absoluteImagesPath = System.getProperty("user.dir") + "/" + imagesPath;
            }

            // Create directory structure: {absoluteImagesPath}/result/
            String resultDir = absoluteImagesPath + "/result";
            Files.createDirectories(Paths.get(resultDir));

            // File name: sessionId.png
            String fileName = sessionId + ".png";
            String filePath = resultDir + "/" + fileName;

            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }

            // Return full URL instead of file:// path
            String imageUrl = baseUrl + "/media/images/result/" + fileName;
            logger.debug("Image saved to: {}, URL: {}", filePath, imageUrl);
            return imageUrl;

        } catch (Exception e) {
            logger.error("Failed to save base64 image", e);
            throw new IOException("Failed to save image: " + e.getMessage());
        }
    }
}