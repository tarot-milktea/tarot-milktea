package org.com.taro.service;

import java.util.List;
import java.util.stream.Collectors;

import org.com.taro.dto.TaroCard;
import org.springframework.stereotype.Service;

@Service
public class TarotPromptService {
    public String generateJSONReadingPrompt(String category, String topic, String question, List<TaroCard> taroCards) {
        String systemPrompt = """
                당신은 타로 해석 전문가입니다. 
                결과를 JSON 형태로 구조화하여 제공해주세요. 
                문장은 복잡하지 않게 작성해주세요.
                """;
        String cardDescriptions = taroCards.stream()
            .map(card -> String.format("%d. %s (%s) - %s\\n   의미: %s", 
                card.getId(),
                card.getNameKo(),
                // 정방향
                card.getMeaningUpright(),
                // 역방향
                card.getMeaningReversed()))
                
            .collect(Collectors.joining("\\n"));
        String userPrompt = String.format("""
            질문: "%s"
            분야: %s > %s
            카드: %s
            
            다음 JSON 형식으로 해석 결과를 제공해주세요:
            
            {
                "overallSituation": "전체적인 상황 분석 (3-4문장)",
                "cardInterpretations": [
                    {
                        "position": 1,
                        "cardName": "%s",
                        "positionMeaning": "%s", 
                        "interpretation": "이 카드의 구체적 해석 (2-3문장)"
                    },
                    {
                        "position": 2,
                        "cardName": "%s",
                        "positionMeaning": "%s",
                        "interpretation": "이 카드의 구체적 해석 (2-3문장)"
                    },
                    {
                        "position": 3,
                        "cardName": "%s", 
                        "positionMeaning": "%s",
                        "interpretation": "이 카드의 구체적 해석 (2-3문장)"
                    }
                ],
                "advice": "종합적인 조언 (3-4문장)",
                "keyMessage": "핵심 메시지 (1-2문장)"
            }
            
            반드시 유효한 JSON만 응답해주세요. 마크다운이나 다른 텍스트는 포함하지 마세요.
            """, 
            question, category, topic, cardDescriptions,
            cards.get(0).getName(), cards.get(0).getPositionMeaning(),
            cards.get(1).getName(), cards.get(1).getPositionMeaning(),
            cards.get(2).getName(), cards.get(2).getPositionMeaning());
        
        return createPromptPair(systemPrompt, userPrompt);
    }

    private String createPromptPair(String systemPrompt, String userPrompt) {
        return "SYSTEM: " + systemPrompt + "\n\nUSER: " + userPrompt;
    }
}