package org.com.taro.service.ai;

import org.com.taro.entity.Reader;
import org.com.taro.repository.ReaderRepository;
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
        switch (readerType) {
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
        switch (readerType) {
            case "F":
                return "당신은 30년 경력의 감성적인 타로 리더입니다. " +
                       "감정과 직관을 중시하며, 상담자의 마음에 깊이 공감합니다. " +
                       "카드들 간의 감정적 연결고리를 찾아 따뜻하고 위로가 되는 해석을 제공해주세요.";

            case "T":
                return "당신은 논리적이고 분석적인 타로 마스터입니다. " +
                       "패턴과 인과관계를 중시하며, 실용적인 조언을 제공합니다. " +
                       "카드들 간의 논리적 연결과 원인-결과 관계를 명확히 분석하여 해석해주세요.";

            case "FT":
                return "당신은 감성과 이성의 균형을 추구하는 타로 전문가입니다. " +
                       "직관적 통찰과 논리적 분석을 조화롭게 활용합니다. " +
                       "카드들의 감정적 메시지와 현실적 의미를 모두 고려한 균형잡힌 해석을 제공해주세요.";

            default:
                return "당신은 전문 타로 리더입니다. " +
                       "과거, 현재, 미래 카드들이 하나의 이야기로 연결되도록 " +
                       "일관성 있고 통찰력 있는 해석을 제공해주세요.";
        }
    }

    private String getFeelingTypeCardPrompt(String timeFrame, boolean hasPreviousContext) {
        if (!hasPreviousContext) {
            return String.format("이 %s 카드에서 느껴지는 감정적 에너지와 직관적 메시지를 해석해주세요.", timeFrame);
        }

        switch (timeFrame) {
            case "현재":
                return "과거 카드에서 나타난 감정의 흐름이 현재에 어떻게 이어지고 있는지, " +
                       "마음속 깊은 변화와 감정적 성장을 중심으로 현재 카드를 해석해주세요.";
            case "미래":
                return "과거와 현재를 거쳐온 감정의 여정이 미래에 어떤 치유와 희망으로 이어질지, " +
                       "마음의 성장과 감정적 만족을 중심으로 미래 카드를 해석해주세요.";
            default:
                return String.format("앞서 해석한 카드들과의 감정적 연결을 고려하여 이 %s 카드를 해석해주세요.", timeFrame);
        }
    }

    private String getThinkingTypeCardPrompt(String timeFrame, boolean hasPreviousContext) {
        if (!hasPreviousContext) {
            return String.format("이 %s 카드가 보여주는 상황의 원인과 패턴을 논리적으로 분석해주세요.", timeFrame);
        }

        switch (timeFrame) {
            case "현재":
                return "과거 카드에서 분석한 원인과 패턴이 현재 상황에 어떤 구체적 영향을 미쳤는지, " +
                       "인과관계와 현실적 변화를 중심으로 현재 카드를 분석해주세요.";
            case "미래":
                return "과거의 원인과 현재의 결과를 토대로 미래에 예상되는 논리적 전개와 " +
                       "실현 가능한 목표, 구체적 행동 방향을 중심으로 미래 카드를 분석해주세요.";
            default:
                return String.format("앞서 분석한 인과관계를 바탕으로 이 %s 카드의 논리적 의미를 해석해주세요.", timeFrame);
        }
    }

    private String getBalancedTypeCardPrompt(String timeFrame, boolean hasPreviousContext) {
        if (!hasPreviousContext) {
            return String.format("이 %s 카드의 감정적 메시지와 현실적 의미를 균형있게 해석해주세요.", timeFrame);
        }

        switch (timeFrame) {
            case "현재":
                return "과거에서 드러난 감정적 흐름과 현실적 상황이 현재에 어떻게 조화를 이루고 있는지, " +
                       "내면의 성장과 외적 변화를 모두 고려하여 현재 카드를 해석해주세요.";
            case "미래":
                return "과거부터 현재까지의 감정적 여정과 현실적 변화가 미래에 어떤 완성된 모습으로 " +
                       "나타날지, 내적 만족과 외적 성취의 조화를 중심으로 미래 카드를 해석해주세요.";
            default:
                return String.format("앞서 해석한 감정적 흐름과 현실적 패턴을 종합하여 이 %s 카드를 해석해주세요.", timeFrame);
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
        switch (readerType) {
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
            case "현재":
                return "과거의 감정이 현재 마음에 어떤 울림을 주고 있나요?";
            case "미래":
                return "이 감정의 흐름이 미래에 어떤 아름다운 결실을 맺을까요?";
            default:
                return "감정의 연결고리를 따라 이어지는 이야기는?";
        }
    }

    private String getThinkingConnectionPhrase(String timeFrame) {
        switch (timeFrame) {
            case "현재":
                return "과거의 결정이 현재 상황에 미친 논리적 영향은?";
            case "미래":
                return "현재까지의 패턴을 토대로 예측되는 미래는?";
            default:
                return "인과관계를 통해 분석한 다음 단계는?";
        }
    }

    private String getBalancedConnectionPhrase(String timeFrame) {
        switch (timeFrame) {
            case "현재":
                return "과거의 경험이 현재에 주는 감정적, 현실적 의미는?";
            case "미래":
                return "내면의 성장과 외적 변화가 미래에 만들어낼 조화는?";
            default:
                return "감정과 현실이 만나는 지점에서 보이는 다음 이야기는?";
        }
    }

    private String getDefaultConnectionPhrase(String timeFrame) {
        switch (timeFrame) {
            case "현재":
                return "과거와 현재의 연결점은?";
            case "미래":
                return "지금까지의 흐름이 미래에 가져다줄 변화는?";
            default:
                return "이어지는 이야기는?";
        }
    }
}