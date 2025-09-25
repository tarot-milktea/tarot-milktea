package org.com.taro.service.ai;

import org.com.taro.entity.Reader;
import org.com.taro.repository.ReaderRepository;
import org.com.taro.service.ReferenceDataService;
import org.com.taro.constants.ValidationConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class ReaderPersonaService {

    private static final Logger logger = LoggerFactory.getLogger(ReaderPersonaService.class);

    @Autowired
    private ReaderRepository readerRepository;

    @Autowired
    private ReferenceDataService referenceDataService;

    /**
     * Get reader-specific system prompt for conversation context
     */
    public String getSystemPrompt(String readerType) {
        try {
            Optional<Reader> readerOpt = readerRepository.findByType(readerType);
            if (readerOpt.isPresent()) {
                Reader reader = readerOpt.get();
                return buildSystemPrompt(reader.getName(), reader.getDescription());
            }
        } catch (Exception e) {
            logger.warn("Failed to fetch reader from database, using fallback: {}", e.getMessage());
        }

        // Fallback to hardcoded prompts
        return getDefaultSystemPrompt(readerType);
    }

    /**
     * Get reader-specific card interpretation prompt
     */
    public String getCardPrompt(String readerType, String timeFrame, boolean hasPreviousContext) {
        if (!referenceDataService.isValidReaderType(readerType)) {
            logger.warn("Unknown reader type: {}, using default", readerType);
            return getFeelingTypeCardPrompt(timeFrame, hasPreviousContext); // default
        }

        // Use reader type code to determine prompt style
        // This logic can be enhanced by adding prompt configuration to database
        switch (readerType.toUpperCase()) {
            case "F": // Feeling/감성형
                return getFeelingTypeCardPrompt(timeFrame, hasPreviousContext);
            case "T": // Thinking/논리형
                return getThinkingTypeCardPrompt(timeFrame, hasPreviousContext);
            case "FT": // Balanced/균형형
                return getBalancedTypeCardPrompt(timeFrame, hasPreviousContext);
            default:
                return getDefaultCardPrompt(timeFrame, hasPreviousContext);
        }
    }

    private String buildSystemPrompt(String readerName, String description) {
        return String.format("당신은 %s입니다. %s " +
                "타로 카드를 통해 질문자의 과거, 현재, 미래를 연결하는 일관된 이야기를 만들어주세요. " +
                "각 카드는 서로 영향을 주고받는 관계임을 기억하고, " +
                "앞서 해석한 카드들과의 연관성을 반드시 언급하며 해석해주세요.",
                readerName, description);
    }

    private String getDefaultSystemPrompt(String readerType) {
        if (!referenceDataService.isValidReaderType(readerType)) {
            return "당신은 전문 타로 리더입니다. " +
                   "과거, 현재, 미래 카드들이 하나의 이야기로 연결되도록 " +
                   "일관성 있고 통찰력 있는 해석을 친근한 구어체로 3줄 이내로 제공해주세요.";
        }

        switch (readerType.toUpperCase()) {
            case "F":
                return "당신은 따뜻한 친구같은 타로 리더입니다. " +
                       "상담자의 감정에 깊이 공감하며 '~해요', '~네요' 같은 부드러운 구어체를 사용하세요. " +
                       "마치 오래된 친구가 위로하듯 따뜻하고 편안한 대화체로 3줄 이내로 답변하세요.";
            case "T":
                return "당신은 실용적인 조언을 주는 타로 리더입니다. " +
                       "핵심을 짚어주며 '~입니다', '~하세요' 같은 명확한 구어체를 사용하세요. " +
                       "현실적이고 실행 가능한 조언을 친근하게 3줄 이내로 전달하세요.";
            case "FT":
                return "당신은 지혜로운 인생 선배같은 타로 리더입니다. " +
                       "감정을 이해하면서도 현실적 조언을 '~죠', '~거든요' 같은 편안한 구어체로 전달하세요. " +
                       "균형잡힌 시각으로 따뜻하면서도 실용적인 조언을 3줄 이내로 나누어주세요.";
            default:
                return "당신은 전문 타로 리더입니다. " +
                       "과거, 현재, 미래 카드들이 하나의 이야기로 연결되도록 " +
                       "일관성 있고 통찰력 있는 해석을 친근한 구어체로 3줄 이내로 제공해주세요.";
        }
    }

    private String getFeelingTypeCardPrompt(String timeFrame, boolean hasPreviousContext) {
        if (!hasPreviousContext) {
            return String.format("이 %s 카드가 전하는 감정을 느껴보며, 친구에게 위로하듯 따뜻하게 3줄로 이야기해주세요.", timeFrame);
        }

        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PRESENT:
                return "과거의 아픔이 지금 어떻게 치유되고 있는지, 공감하며 3줄로 들려주세요.";
            case ValidationConstants.TIMEFRAME_FUTURE:
                return "희망과 기대를 품고, 긍정적인 미래를 친구처럼 3줄로 격려해주세요.";
            default:
                return String.format("앞서 해석한 감정의 흐름과 연결하여 이 %s 카드를 따뜻하게 3줄로 이야기해주세요.", timeFrame);
        }
    }

    private String getThinkingTypeCardPrompt(String timeFrame, boolean hasPreviousContext) {
        if (!hasPreviousContext) {
            return String.format("이 %s 카드가 보여주는 원인과 패턴을 간단명료하게 분석해서 3줄로 설명해주세요.", timeFrame);
        }

        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PRESENT:
                return "현재 상황을 객관적으로 파악하고 실용적 조언을 3줄로 제시해주세요.";
            case ValidationConstants.TIMEFRAME_FUTURE:
                return "예상되는 결과와 대응 전략을 구체적으로 3줄로 조언해주세요.";
            default:
                return String.format("앞서 분석한 인과관계를 바탕으로 이 %s 카드를 명확하게 3줄로 설명해주세요.", timeFrame);
        }
    }

    private String getBalancedTypeCardPrompt(String timeFrame, boolean hasPreviousContext) {
        if (!hasPreviousContext) {
            return String.format("이 %s 카드의 감정적 메시지와 현실적 의미를 편하게 3줄로 설명해주세요.", timeFrame);
        }

        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PRESENT:
                return "마음을 이해하면서도 현실적 관점을 3줄로 제시해주세요.";
            case ValidationConstants.TIMEFRAME_FUTURE:
                return "희망적이면서도 실현 가능한 미래를 3줄로 그려주세요.";
            default:
                return String.format("앞서 해석한 감정적 흐름과 현실적 패턴을 종합하여 이 %s 카드를 편하게 3줄로 설명해주세요.", timeFrame);
        }
    }

    private String getDefaultCardPrompt(String timeFrame, boolean hasPreviousContext) {
        if (!hasPreviousContext) {
            return String.format("이 %s 카드의 의미를 해석해주세요.", timeFrame);
        }

        return String.format("앞서 해석한 카드들과의 연관성을 고려하여 이 %s 카드를 해석해주세요.", timeFrame);
    }

    /**
     * Get reader-specific connection phrases for linking interpretations
     */
    public String getConnectionPhrase(String readerType, String timeFrame) {
        if (!referenceDataService.isValidReaderType(readerType)) {
            return getDefaultConnectionPhrase(timeFrame);
        }

        switch (readerType.toUpperCase()) {
            case "F":
                return getFeelingConnectionPhrase(timeFrame);
            case "T":
                return getThinkingConnectionPhrase(timeFrame);
            case "FT":
                return getBalancedConnectionPhrase(timeFrame);
            default:
                return getDefaultConnectionPhrase(timeFrame);
        }
    }

    private String getFeelingConnectionPhrase(String timeFrame) {
        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PRESENT:
                return "과거의 감정이 현재 마음에 어떤 울림을 주고 있나요?";
            case ValidationConstants.TIMEFRAME_FUTURE:
                return "이 감정의 흐름이 미래에 어떤 아름다운 결실을 맺을까요?";
            default:
                return "감정의 연결고리를 따라 이어지는 이야기는?";
        }
    }

    private String getThinkingConnectionPhrase(String timeFrame) {
        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PRESENT:
                return "과거의 결정이 현재 상황에 미친 논리적 영향은?";
            case ValidationConstants.TIMEFRAME_FUTURE:
                return "현재까지의 패턴을 토대로 예측되는 미래는?";
            default:
                return "인과관계를 통해 분석한 다음 단계는?";
        }
    }

    private String getBalancedConnectionPhrase(String timeFrame) {
        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PRESENT:
                return "과거의 경험이 현재에 주는 감정적, 현실적 의미는?";
            case ValidationConstants.TIMEFRAME_FUTURE:
                return "내면의 성장과 외적 변화가 미래에 만들어낼 조화는?";
            default:
                return "감정과 현실이 만나는 지점에서 보이는 다음 이야기는?";
        }
    }

    private String getDefaultConnectionPhrase(String timeFrame) {
        switch (timeFrame) {
            case ValidationConstants.TIMEFRAME_PRESENT:
                return "과거와 현재의 연결점은?";
            case ValidationConstants.TIMEFRAME_FUTURE:
                return "지금까지의 흐름이 미래에 가져다줄 변화는?";
            default:
                return "이어지는 이야기는?";
        }
    }
}