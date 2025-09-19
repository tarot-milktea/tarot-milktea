package org.com.taro.service.ai;

import org.com.taro.dto.SubmitRequest;
import org.com.taro.dto.TaroResultResponse;
import org.com.taro.entity.*;
import org.com.taro.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PromptService {

    private final TaroReadingRepository taroReadingRepository;
    private final DrawnCardRepository drawnCardRepository;
    private final TaroCardRepository taroCardRepository;

    public PromptService(TaroReadingRepository taroReadingRepository,
                        DrawnCardRepository drawnCardRepository,
                        TaroCardRepository taroCardRepository) {
        this.taroReadingRepository = taroReadingRepository;
        this.drawnCardRepository = drawnCardRepository;
        this.taroCardRepository = taroCardRepository;
    }

    // TaroAiService에서 호출하는 메인 메서드
    public String createPrompt(SubmitRequest request, String sessionId) {
        StringBuilder prompt = new StringBuilder();
        
        // 1. 시스템 지시사항 (JSON 형식 강제)
        prompt.append("당신은 전문 타로 리더입니다. 반드시 다음 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요:\n\n");
        
        // 2. 정확한 JSON 형식 예시
        prompt.append("{\n");
        prompt.append("  \"interpretation\": \"여기에 타로 해석 내용을 300-500자로 작성\",\n");
        prompt.append("  \"readerMessage\": \"여기에 리더의 조언을 100-200자로 작성\",\n");
        prompt.append("  \"fortuneScore\": 75\n");
        prompt.append("}\n\n");
        
        // 3. 리더 타입별 톤 설정
        prompt.append("리더 스타일: ").append(getReaderStyle(request.getReaderType())).append("\n\n");
        
        // 4. 상담 정보
        prompt.append("타로 상담:\n");
        prompt.append("- 카테고리: ").append(getCategoryName(request.getCategoryCode())).append("\n");
        prompt.append("- 주제: ").append(getTopicName(request.getTopicCode())).append("\n");
        prompt.append("- 질문: \"").append(request.getQuestionText()).append("\"\n\n");
        
        // 5. 선택된 카드 정보 (DB에서 조회)
        prompt.append("선택된 카드:\n");
        try {
            List<DrawnCard> drawnCards = getStoredCards(sessionId);
            for (int i = 0; i < drawnCards.size(); i++) {
                DrawnCard drawnCard = drawnCards.get(i);
                TaroCardEntity cardEntity = taroCardRepository.findById(Long.valueOf(drawnCard.getCardId()))
                    .orElseThrow(() -> new RuntimeException("Card not found: " + drawnCard.getCardId()));

                String position = getPositionName(drawnCard.getPosition());
                String orientation = drawnCard.getOrientation() == DrawnCard.Orientation.upright ? "정방향" : "역방향";

                prompt.append(String.format("%d번째 카드 (%s): %s (%s)\n",
                    i + 1,
                    position,
                    cardEntity.getNameKo(),
                    orientation
                ));
            }
        } catch (Exception e) {
            prompt.append("카드 정보를 불러올 수 없습니다.\n");
        }
        
        return prompt.toString();
    }
    
    private String getReaderStyle(String readerType) {
        switch (readerType) {
            case "F": return "감성적이고 따뜻한 어조로 해석";
            case "T": return "논리적이고 현실적인 어조로 해석";
            case "FT": return "감성과 이성의 균형잡힌 어조로 해석";
            default: return "전문적인 어조로 해석";
        }
    }
    
    public String buildSystemPrompt(String readerType) {
        switch (readerType) {
            case "F":
                return "당신은 30년 경력의 감성적인 타로 리더입니다. " +
                       "감정을 중시하고 따뜻한 해석을 제공하며, 상담자의 마음에 공감하는 스타일로 답변합니다.";
            case "T":
                return "당신은 논리적이고 현실적인 타로 마스터입니다. " +
                       "객관적이고 실용적인 조언을 제공하며, 현실적인 해결책을 제시하는 스타일로 답변합니다.";
            case "FT":
                return "당신은 감성과 이성의 균형을 중시하는 타로 전문가입니다. " +
                       "감정적 공감과 논리적 분석을 모두 활용하여 균형잡힌 해석을 제공합니다.";
            default:
                return "당신은 전문 타로 리더입니다. 정확하고 도움이 되는 해석을 제공해주세요.";
        }
    }
    
    public String buildUserPrompt(SubmitRequest request, String sessionId) {
        StringBuilder prompt = new StringBuilder();

        // 기본 정보
        prompt.append("타로 상담 정보:\n");
        prompt.append("- 카테고리: ").append(getCategoryName(request.getCategoryCode())).append("\n");
        prompt.append("- 주제: ").append(getTopicName(request.getTopicCode())).append("\n");
        prompt.append("- 질문: \"").append(request.getQuestionText()).append("\"\n\n");

        // 선택된 카드 정보 (DB에서 조회)
        prompt.append("선택된 카드:\n");
        try {
            List<DrawnCard> drawnCards = getStoredCards(sessionId);
            for (int i = 0; i < drawnCards.size(); i++) {
                DrawnCard drawnCard = drawnCards.get(i);
                TaroCardEntity cardEntity = taroCardRepository.findById(Long.valueOf(drawnCard.getCardId()))
                    .orElseThrow(() -> new RuntimeException("Card not found: " + drawnCard.getCardId()));

                String position = getPositionName(drawnCard.getPosition());
                String orientation = drawnCard.getOrientation() == DrawnCard.Orientation.upright ? "정방향" : "역방향";

                prompt.append(String.format("%d. %s (%s) - %s\n",
                    i + 1,
                    cardEntity.getNameKo(),
                    orientation,
                    position
                ));
            }
        } catch (Exception e) {
            prompt.append("카드 정보를 불러올 수 없습니다.\n");
        }

        prompt.append("\n위 정보를 바탕으로 3장의 카드에 대한 타로 해석을 제공해주세요.");

        return prompt.toString();
    }
    
    public String getCardDescription(TaroResultResponse.DrawnCard card) {
        return String.format("%s (%s) - %s", 
            card.getNameKo(), 
            card.getOrientation(), 
            card.getMeaning()
        );
    }
    
    public String getCategoryContext(String categoryCode) {
        switch (categoryCode) {
            case "LOVE":
                return "연애와 관련된 고민";
            case "JOB":
                return "취업과 커리어에 관련된 고민";
            case "MONEY":
                return "금전과 재정에 관련된 고민";
            default:
                return "일반적인 고민";
        }
    }
    
    // 헬퍼 메서드들
    private String getCategoryName(String categoryCode) {
        switch (categoryCode) {
            case "LOVE": return "연애";
            case "JOB": return "취업";
            case "MONEY": return "금전";
            default: return categoryCode;
        }
    }
    
    private String getTopicName(String topicCode) {
        // 간단한 매핑 - 실제로는 더 상세한 매핑 필요
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

    // 헬퍼 메서드: 세션의 저장된 카드 조회
    private List<DrawnCard> getStoredCards(String sessionId) {
        // 세션에 해당하는 TaroReading 찾기
        TaroReading taroReading = taroReadingRepository.findBySessionId(sessionId)
            .stream().findFirst()
            .orElseThrow(() -> new RuntimeException("TaroReading not found for session: " + sessionId));

        // 해당 reading의 drawn_cards 조회
        return drawnCardRepository.findByReadingIdOrderByPosition(taroReading.getId());
    }

    // 헬퍼 메서드: 포지션 이름 변환
    private String getPositionName(int position) {
        switch (position) {
            case 1: return "과거";
            case 2: return "현재";
            case 3: return "미래";
            default: return "위치" + position;
        }
    }
}