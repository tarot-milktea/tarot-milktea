package org.com.taro.service.ai;

import org.com.taro.dto.SubmitRequest;
import org.com.taro.dto.TaroResultResponse;
import org.com.taro.entity.*;
import org.com.taro.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PromptService {

    private final TaroReadingRepository taroReadingRepository;
    private final DrawnCardRepository drawnCardRepository;
    private final TaroCardRepository taroCardRepository;
    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;
    private final ReaderRepository readerRepository;

    public PromptService(TaroReadingRepository taroReadingRepository,
                        DrawnCardRepository drawnCardRepository,
                        TaroCardRepository taroCardRepository,
                        CategoryRepository categoryRepository,
                        TopicRepository topicRepository,
                        ReaderRepository readerRepository) {
        this.taroReadingRepository = taroReadingRepository;
        this.drawnCardRepository = drawnCardRepository;
        this.taroCardRepository = taroCardRepository;
        this.categoryRepository = categoryRepository;
        this.topicRepository = topicRepository;
        this.readerRepository = readerRepository;
    }

    // Deprecated - Use createCardPrompt() for individual cards instead
    // This method was for processing all cards at once which is no longer used
    
    private String getReaderStyle(String readerType) {
        try {
            Optional<Reader> readerOpt = readerRepository.findByType(readerType);
            if (readerOpt.isPresent()) {
                Reader reader = readerOpt.get();
                return reader.getDescription() + " style interpretation";
            }
        } catch (Exception e) {
            // Fallback to default descriptions
        }

        // 기본 설명
        switch (readerType) {
            case "F": return "감성적이고 따뜻한 어조로 해석";
            case "T": return "논리적이고 현실적인 어조로 해석";
            case "FT": return "감성과 이성의 균형잡힌 어조로 해석";
            default: return "전문적인 어조로 해석";
        }
    }
    
    public String buildSystemPrompt(String readerType) {
        try {
            Optional<Reader> readerOpt = readerRepository.findByType(readerType);
            if (readerOpt.isPresent()) {
                Reader reader = readerOpt.get();
                return "당신은 " + reader.getName() + ", 전문 타로 리더입니다. " +
                       reader.getDescription() + " 통찰력 있고 도움이 되는 타로 해석을 제공해주세요.";
            }
        } catch (Exception e) {
            // Fallback to default descriptions
        }

        // 기본 시스템 프롬프트
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
    
    // Deprecated - Use createCardPrompt() and createSummaryPrompt() instead
    
    /**
     * Create prompt for advice image generation
     */
    public String createImagePrompt(String summary, SubmitRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Create a mystical tarot card illustration that represents: ");
        prompt.append(getCategoryContext(request.getCategoryCode())).append(". ");
        prompt.append("The overall message is about hope and guidance. ");
        prompt.append("Style: ethereal, magical, tarot card art, purple and gold color scheme, ");
        prompt.append("mystical symbols, gentle and positive atmosphere.");

        return prompt.toString();
    }

    private String getCategoryContext(String categoryCode) {
        switch (categoryCode) {
            case "LOVE":
                return "love and relationships";
            case "JOB":
                return "career and professional growth";
            case "MONEY":
                return "financial prosperity and abundance";
            default:
                return "life guidance and wisdom";
        }
    }
    
    // Helper methods - now using DB data
    private String getCategoryName(String categoryCode) {
        try {
            Optional<Category> categoryOpt = categoryRepository.findByCode(categoryCode);
            if (categoryOpt.isPresent()) {
                return categoryOpt.get().getName();
            }
        } catch (Exception e) {
            // Fall back to default if DB lookup fails
        }

        // 기본 매핑
        switch (categoryCode) {
            case "LOVE": return "연애";
            case "JOB": return "취업";
            case "MONEY": return "금전";
            default: return categoryCode;
        }
    }

    private String getTopicName(String topicCode) {
        try {
            Optional<Topic> topicOpt = topicRepository.findByCode(topicCode);
            if (topicOpt.isPresent()) {
                return topicOpt.get().getName();
            }
        } catch (Exception e) {
            // Fall back to default if DB lookup fails
        }

        // 기본 매핑
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

    /**
     * 개별 카드 해석을 위한 프롬프트 생성
     */
    public String createCardPrompt(DrawnCard drawnCard, SubmitRequest request, String timeFrame) {
        StringBuilder prompt = new StringBuilder();

        try {
            // 카드 정보 조회
            TaroCardEntity cardEntity = taroCardRepository.findById(Long.valueOf(drawnCard.getCardId()))
                .orElseThrow(() -> new RuntimeException("Card not found: " + drawnCard.getCardId()));

            // 시스템 지시사항
            prompt.append("당신은 전문 타로 리더입니다. ")
                  .append(getReaderStyle(request.getReaderType()))
                  .append("\n\n");

            // 상담 정보
            prompt.append("상담 정보:\n");
            prompt.append("- 카테고리: ").append(getCategoryName(request.getCategoryCode())).append("\n");
            prompt.append("- 주제: ").append(getTopicName(request.getTopicCode())).append("\n");
            prompt.append("- 질문: \"").append(request.getQuestionText()).append("\"\n\n");

            // 카드 정보
            String orientation = drawnCard.getOrientation() == DrawnCard.Orientation.upright ? "정방향" : "역방향";
            prompt.append("해석할 카드:\n");
            prompt.append("- 카드명: ").append(cardEntity.getNameKo()).append(" (").append(cardEntity.getNameEn()).append(")\n");
            prompt.append("- 방향: ").append(orientation).append("\n");
            prompt.append("- 시점: ").append(timeFrame).append("\n");

            // 카드 의미 추가 (정방향/역방향에 따라)
            String meaning = drawnCard.getOrientation() == DrawnCard.Orientation.upright ?
                cardEntity.getMeaningUpright() : cardEntity.getMeaningReversed();
            prompt.append("- 기본 의미: ").append(meaning).append("\n\n");

            // 요청사항
            prompt.append("위 ").append(timeFrame).append(" 카드에 대해 질문자의 상황에 맞춰 친구에게 말하듯 편하고 따뜻하게 3줄 이내로 설명해주세요. ");
            prompt.append("카드의 의미를 질문자의 ").append(getCategoryName(request.getCategoryCode())).append(" 고민과 연결하여 구어체로 해석해주세요.");

        } catch (Exception e) {
            prompt.append("카드 정보를 불러올 수 없어 기본 해석을 제공합니다.");
        }

        return prompt.toString();
    }

    /**
     * 총평 생성을 위한 프롬프트 생성
     */
    public String createSummaryPrompt(String pastInterpretation, String presentInterpretation,
                                    String futureInterpretation, SubmitRequest request) {
        StringBuilder prompt = new StringBuilder();

        // 시스템 지시사항
        prompt.append("당신은 전문 타로 리더입니다. ")
              .append(getReaderStyle(request.getReaderType()))
              .append("\n\n");

        // 상담 정보
        prompt.append("상담 정보:\n");
        prompt.append("- 카테고리: ").append(getCategoryName(request.getCategoryCode())).append("\n");
        prompt.append("- 주제: ").append(getTopicName(request.getTopicCode())).append("\n");
        prompt.append("- 질문: \"").append(request.getQuestionText()).append("\"\n\n");

        // 각 카드별 해석
        prompt.append("각 시점별 카드 해석:\n\n");
        prompt.append("【과거】\n").append(pastInterpretation).append("\n\n");
        prompt.append("【현재】\n").append(presentInterpretation).append("\n\n");
        prompt.append("【미래】\n").append(futureInterpretation).append("\n\n");

        // 리더 타입별 총평 요청
        String readerType = request.getReaderType();
        switch (readerType) {
            case "F":
                prompt.append("세 카드가 전하는 감정의 흐름을 따라가며, 마음을 어루만지는 따뜻한 메시지를 친구처럼 3줄로 전해주세요.");
                break;
            case "T":
                prompt.append("세 카드의 인과관계를 분석하여, 핵심 조언과 행동 지침을 명확하게 3줄로 정리해주세요.");
                break;
            case "FT":
                prompt.append("세 카드의 감정적 메시지와 현실적 조언을 조화롭게 엮어 지혜로운 조언을 3줄로 전달해주세요.");
                break;
            default:
                prompt.append("세 카드의 메시지를 종합하여 친근하고 도움이 되는 조언을 3줄로 전달해주세요.");
        }

        return prompt.toString();
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