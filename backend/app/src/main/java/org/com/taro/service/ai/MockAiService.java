package org.com.taro.service.ai;

import org.com.taro.dto.ChatMessage;
import org.com.taro.dto.ImageGenerationResult;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Random;

@Service
public class MockAiService {

    private static final Logger logger = LoggerFactory.getLogger(MockAiService.class);

    /**
     * Mock implementation of conversation-based card interpretation
     */
    public String interpretWithConversation(List<ChatMessage> messages) {
        logger.info("🎭 Mock AI - Generating conversation-based interpretation (messages: {})",
                messages.size());

        // Simulate API call delay (1-3 seconds)
        simulateApiDelay(1000, 3000);

        // Extract timeframe from the last user message to provide contextual response
        String lastUserMessage = messages.get(messages.size() - 1).getContent().toLowerCase();
        String timeFrame = extractTimeFrame(lastUserMessage);
        String readerType = extractReaderType(messages);

        return generateMockInterpretation(timeFrame, readerType);
    }

    /**
     * Mock implementation of summary generation
     */
    public String generateSummaryText(String prompt) {
        logger.info("🎭 Mock AI - Generating summary text");

        // Simulate API call delay (2-4 seconds for summary)
        simulateApiDelay(2000, 4000);

        String[] summaryTemplates = {
                "종합적으로 볼 때, 현재 상황은 새로운 변화의 시기를 맞이하고 있습니다. 과거의 경험들이 현재의 지혜로 이어지며, 미래에는 더욱 밝은 전망이 기다리고 있습니다. 꾸준한 노력과 긍정적인 마음가짐을 유지한다면 원하는 목표를 달성할 수 있을 것입니다.",
                "세 장의 카드가 전하는 메시지는 분명합니다. 과거의 도전들을 통해 성장한 당신은 현재 중요한 선택의 기로에 서 있습니다. 미래는 당신의 결정에 따라 달라질 것이며, 용기 있는 선택이 성공으로 이어질 것입니다.",
                "카드들이 보여주는 흐름은 매우 긍정적입니다. 과거의 시련을 극복한 경험이 현재의 안정감으로 이어지고 있으며, 앞으로는 더욱 발전된 모습으로 성장할 수 있는 기회가 열릴 것입니다. 자신감을 가지고 앞으로 나아가세요."};

        Random random = new Random();
        return summaryTemplates[random.nextInt(summaryTemplates.length)];
    }

    /**
     * Mock implementation of image generation
     */
    public ImageGenerationResult generateImage(String prompt, String sessionId) {
        logger.info("🎭 Mock AI - Generating advice image for session: {}", sessionId);

        // Simulate image generation delay (3-5 seconds)
        simulateApiDelay(3000, 5000);

        String[] mockImageUrls = {"https://j13a601.p.ssafy.io/media/images/ssafy.png"};

        String[] mockDescriptions = {"조화로운 에너지가 흐르는 신비로운 타로 이미지", "희망과 성장을 상징하는 밝은 빛의 타로 카드",
                "지혜와 통찰을 나타내는 우주적 에너지의 모습"};

        Random random = new Random();
        int index = random.nextInt(mockImageUrls.length);

        return new ImageGenerationResult(mockImageUrls[index], mockDescriptions[index]);
    }

    /**
     * Simulate API call delay with random duration
     */
    private void simulateApiDelay(int minMs, int maxMs) {
        try {
            Random random = new Random();
            int delay = random.nextInt(maxMs - minMs + 1) + minMs;
            logger.debug("🎭 Mock API delay: {}ms", delay);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Mock API delay interrupted", e);
        }
    }

    /**
     * Extract timeframe from user message
     */
    private String extractTimeFrame(String message) {
        if (message.contains("과거")) {
            return "과거";
        } else if (message.contains("현재")) {
            return "현재";
        } else if (message.contains("미래")) {
            return "미래";
        }
        return "과거"; // default
    }

    /**
     * Extract reader type from system message
     */
    private String extractReaderType(List<ChatMessage> messages) {
        for (ChatMessage message : messages) {
            if ("system".equals(message.getRole())) {
                String content = message.getContent().toLowerCase();
                if (content.contains("감성") || content.contains("감정")) {
                    return "F";
                } else if (content.contains("논리") || content.contains("이성")) {
                    return "T";
                } else if (content.contains("균형") || content.contains("조화")) {
                    return "FT";
                }
            }
        }
        return "FT"; // default
    }

    /**
     * Generate mock interpretation based on timeframe and reader type
     */
    private String generateMockInterpretation(String timeFrame, String readerType) {
        String baseInterpretation = getMockInterpretationByTimeFrame(timeFrame);
        String readerStyle = getReaderStyleSuffix(readerType);

        return baseInterpretation + "\n\n" + readerStyle;
    }

    /**
     * Get mock interpretation by timeframe
     */
    private String getMockInterpretationByTimeFrame(String timeFrame) {
        switch (timeFrame) {
            case "과거":
                return "과거의 경험들이 현재의 당신을 만들어낸 소중한 자산입니다. 지나온 시련들은 모두 성장의 밑거름이 되었으며, "
                        + "그때의 선택들이 지금의 지혜로 이어지고 있습니다. 과거를 받아들이고 감사하는 마음이 현재의 평화를 가져다줄 것입니다.";
            case "현재":
                return "현재 상황은 새로운 기회와 가능성으로 가득 차 있습니다. 과거의 경험을 바탕으로 한 현명한 판단이 필요한 시점이며, "
                        + "주변의 변화에 유연하게 대응하는 것이 중요합니다. 지금 이 순간에 집중하며 최선을 다한다면 좋은 결과를 얻을 수 있을 것입니다.";
            case "미래":
                return "미래는 밝고 희망적인 전망을 보여줍니다. 현재의 노력과 과거의 경험이 합쳐져 원하는 목표에 한 걸음 더 가까워질 것입니다. "
                        + "새로운 기회들이 기다리고 있으며, 용기를 가지고 도전한다면 예상보다 더 큰 성취를 이룰 수 있을 것입니다.";
            default:
                return "카드가 전하는 메시지는 분명합니다. 현재의 상황을 긍정적으로 받아들이고 앞으로 나아가는 것이 중요합니다.";
        }
    }

    /**
     * Get reader style suffix based on reader type
     */
    private String getReaderStyleSuffix(String readerType) {
        switch (readerType) {
            case "F":
                return "마음의 소리에 귀 기울이고 직감을 믿어보세요. 감정적인 지혜가 올바른 길을 안내해줄 것입니다.";
            case "T":
                return "논리적으로 상황을 분석하고 현실적인 계획을 세워보세요. 체계적인 접근이 성공의 열쇠가 될 것입니다.";
            case "FT":
                return "감정과 이성의 균형을 맞춰 종합적으로 판단해보세요. 조화로운 접근 방식이 최선의 결과를 가져다줄 것입니다.";
            default:
                return "균형잡힌 시각으로 상황을 바라보며 현명한 선택을 하시기 바랍니다.";
        }
    }
}
