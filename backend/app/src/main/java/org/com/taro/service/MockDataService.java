package org.com.taro.service;

import org.com.taro.dto.TopicResponse;
import org.com.taro.dto.ReaderResponse;
import org.com.taro.dto.TaroResultResponse;
import org.com.taro.dto.TaroCard;
import org.com.taro.dto.TaroReadingResponse;
import org.com.taro.dto.SubmitRequest;
import org.com.taro.exception.SessionNotFoundException;
import org.com.taro.exception.TaroServiceException;
import org.com.taro.constants.ValidationConstants;
import org.com.taro.enums.CardSuit;
import org.com.taro.enums.CardOrientation;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MockDataService {
    // Test for Jenkins
    private final Map<String, SessionData> sessions = new ConcurrentHashMap<>();
    private final List<TopicResponse.Category> categories;
    private final List<ReaderResponse.Reader> readers;
    private final List<TaroCard> taroCards;
    
    public MockDataService() {
        this.categories = initializeCategories();
        this.readers = initializeReaders();
        this.taroCards = initializeTaroCards();
    }

    public String createSession(String nickname) {
        String sessionId = generateSessionId();
        SessionData sessionData = new SessionData(sessionId, nickname);
        sessions.put(sessionId, sessionData);
        return sessionId;
    }

    private String generateSessionId() {
        Random random = new Random();
        StringBuilder sessionId = new StringBuilder();
        int attempts = 0;
        final int maxAttempts = 1000; // Prevent infinite loop

        do {
            sessionId.setLength(0); // Clear previous attempt
            for (int i = 0; i < ValidationConstants.SESSION_ID_LENGTH; i++) {
                sessionId.append(ValidationConstants.SESSION_ID_CHARS.charAt(random.nextInt(ValidationConstants.SESSION_ID_CHARS.length())));
            }
            attempts++;

            if (attempts > maxAttempts) {
                throw new TaroServiceException("Unable to generate unique session ID after " + maxAttempts + " attempts");
            }
        } while (sessions.containsKey(sessionId.toString()));

        return sessionId.toString();
    }

    public boolean sessionExists(String sessionId) {
        return sessions.containsKey(sessionId);
    }

    public List<TopicResponse.Category> getCategories() {
        return categories;
    }

    public List<ReaderResponse.Reader> getReaders() {
        return readers;
    }

    public void generateTaroResult(String sessionId, String categoryCode, String topicCode,
                                   String questionText, String readerType) {
        if (!sessionExists(sessionId)) {
            throw new SessionNotFoundException(sessionId);
        }

        try {
            // 타로 결과를 내부적으로 생성하고 저장 (실제 구현에서는 데이터베이스에 저장)
            // 여기서는 세션에 결과가 생성되었다는 것만 기록
            System.out.println("타로 결과가 세션 " + sessionId + "에 대해 생성되었습니다.");
        } catch (Exception e) {
            throw new TaroServiceException("Failed to generate tarot result for session: " + sessionId, e);
        }
    }


    public TaroResultResponse generateTaroResultResponse(String sessionId, String categoryCode, String topicCode,
                                                        String questionText, String readerType) {
        // 폴백용 타로 결과 생성 (DB에서 카드 정보 조회 필요)
        List<TaroReadingResponse.DrawnCard> cards = new ArrayList<>();

        // 기본 카드 3장 생성 (실제로는 DB에서 조회해야 함)
        for (int i = 1; i <= 3; i++) {
            cards.add(new TaroReadingResponse.DrawnCard(
                i,
                i,
                "기본 카드 " + i,
                "Default Card " + i,
                "upright",
                "https://example.com/card-" + i + ".webm"
            ));
        }

        // 해석 결과 구성
        TaroResultResponse.InterpretationsDto interpretations = new TaroResultResponse.InterpretationsDto(
            "과거: 기본 과거 해석",
            "현재: 기본 현재 해석",
            "미래: 기본 미래 해석",
            "총평: " + questionText + "에 대한 기본 답변입니다."
        );

        // 행운 카드 구성
        TaroResultResponse.LuckyCardDto luckyCard = new TaroResultResponse.LuckyCardDto(
            "행운의 별",
            "당신의 마음속 작은 용기가 큰 변화를 만들어낼 거예요.", // AI 재해석된 메시지
            "https://example.com/lucky-cards/star.jpg"
        );

        return new TaroResultResponse(
            sessionId,
            "테스트 닉네임",
            "테스트 질문입니다",
            "F",
            "COMPLETED",
            interpretations,
            cards,
            75,
            luckyCard
        );
    }

    public boolean isValidCategoryCode(String categoryCode) {
        return "LOVE".equals(categoryCode) ||
               "JOB".equals(categoryCode) ||
               "MONEY".equals(categoryCode);
    }

    public boolean isValidTopicCode(String categoryCode, String topicCode) {
        if ("LOVE".equals(categoryCode)) {
            return Arrays.asList("REUNION", "NEW_LOVE", "CURRENT_RELATIONSHIP", "MARRIAGE", "BREAKUP").contains(topicCode);
        } else if ("JOB".equals(categoryCode)) {
            return Arrays.asList("JOB_CHANGE", "PROMOTION", "NEW_JOB", "CAREER_PATH", "WORKPLACE").contains(topicCode);
        } else if ("MONEY".equals(categoryCode)) {
            return Arrays.asList("INVESTMENT", "SAVINGS", "DEBT", "INCOME", "BUSINESS").contains(topicCode);
        }
        return false;
    }

    public boolean isValidCard(String suit, String number) {
        if (CardSuit.MAJOR.getCode().equals(suit)) {
            try {
                int num = Integer.parseInt(number);
                return num >= 1 && num <= 22;
            } catch (NumberFormatException e) {
                return false;
            }
        } else if (Arrays.asList(CardSuit.WANDS.getCode(), CardSuit.CUPS.getCode(),
                                CardSuit.SWORDS.getCode(), CardSuit.PENTACLES.getCode()).contains(suit)) {
            return Arrays.asList("ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                                "PAGE", "KNIGHT", "QUEEN", "KING").contains(number);
        }
        return false;
    }

    public TaroCard findCard(String suit, String number) {
        return taroCards.stream()
                .filter(card -> suit.equals(card.getSuit()) && number.equals(card.getNumber()))
                .findFirst()
                .orElse(null);
    }


    private List<TopicResponse.Category> initializeCategories() {
        List<TopicResponse.Category> categories = new ArrayList<>();
        
        // 연애 카테고리
        List<String> reunionQuestions = Arrays.asList(
            "전 연인과 재회할 가능성이 있을까요?",
            "헤어진 이유를 극복할 수 있을까요?",
            "재회 후 관계가 지속될 수 있을까요?"
        );
        List<String> newLoveQuestions = Arrays.asList(
            "새로운 인연을 언제 만날 수 있을까요?",
            "어떤 타입의 사람과 좋은 인연이 될까요?",
            "새로운 연애에서 주의할 점은 무엇인가요?"
        );
        List<String> currentRelationshipQuestions = Arrays.asList(
            "현재 연인과의 관계는 어떻게 발전할까요?",
            "상대방의 진심은 무엇인가요?",
            "우리 관계에서 개선할 점은 무엇인가요?"
        );
        List<String> marriageQuestions = Arrays.asList(
            "현재 연인과 결혼까지 이어질 수 있을까요?",
            "결혼 시기는 언제가 적절할까요?",
            "결혼 준비에서 주의할 점은 무엇인가요?"
        );
        List<String> breakupQuestions = Arrays.asList(
            "이별을 해야 할 시기인가요?",
            "이별 후 상처를 어떻게 치유할까요?",
            "이별의 올바른 이유와 방법은 무엇인가요?"
        );
        
        List<TopicResponse.Topic> loveTopics = Arrays.asList(
            new TopicResponse.Topic("REUNION", "재회", "전 연인과의 재회에 대한 고민", reunionQuestions),
            new TopicResponse.Topic("NEW_LOVE", "새로운 인연", "새로운 연애에 대한 고민", newLoveQuestions),
            new TopicResponse.Topic("CURRENT_RELATIONSHIP", "현재 연애", "현재 연인과의 관계에 대한 고민", currentRelationshipQuestions),
            new TopicResponse.Topic("MARRIAGE", "결혼", "결혼에 대한 고민", marriageQuestions),
            new TopicResponse.Topic("BREAKUP", "이별", "이별에 대한 고민", breakupQuestions)
        );
        
        categories.add(new TopicResponse.Category("LOVE", "연애", "연애와 관련된 고민", loveTopics));
        
        // 취업 카테고리
        List<String> jobChangeQuestions = Arrays.asList(
            "이직을 해야 할 시기인가요?",
            "새로운 직장에서 성공할 수 있을까요?",
            "이직 시 주의해야 할 점은 무엇인가요?"
        );
        List<String> promotionQuestions = Arrays.asList(
            "승진 가능성은 어떻게 될까요?",
            "승진을 위해 무엇을 준비해야 할까요?",
            "상사와의 관계를 어떻게 개선할까요?"
        );
        List<String> newJobQuestions = Arrays.asList(
            "취업에 성공할 수 있을까요?",
            "어떤 분야의 일이 나에게 맞을까요?",
            "면접에서 좋은 결과를 얻을 수 있을까요?"
        );
        List<String> careerPathQuestions = Arrays.asList(
            "현재 커리어 방향이 올바른가요?",
            "장기적인 커리어 목표를 어떻게 설정해야 할까요?",
            "커리어 전환이 필요한 시기인가요?"
        );
        List<String> workplaceQuestions = Arrays.asList(
            "직장 내 인간관계는 어떻게 개선할까요?",
            "현재 업무에서 성과를 낼 수 있을까요?",
            "직장에서의 스트레스를 어떻게 관리할까요?"
        );
        
        List<TopicResponse.Topic> jobTopics = Arrays.asList(
            new TopicResponse.Topic("JOB_CHANGE", "이직", "이직에 대한 고민", jobChangeQuestions),
            new TopicResponse.Topic("PROMOTION", "승진", "승진에 대한 고민", promotionQuestions),
            new TopicResponse.Topic("NEW_JOB", "취업", "취업에 대한 고민", newJobQuestions),
            new TopicResponse.Topic("CAREER_PATH", "커리어", "커리어 방향에 대한 고민", careerPathQuestions),
            new TopicResponse.Topic("WORKPLACE", "직장생활", "직장 내 상황에 대한 고민", workplaceQuestions)
        );
        
        categories.add(new TopicResponse.Category("JOB", "취업", "취업과 커리어에 관련된 고민", jobTopics));
        
        // 금전 카테고리
        List<String> investmentQuestions = Arrays.asList(
            "지금 투자하기에 좋은 시기인가요?",
            "어떤 투자 상품이 나에게 맞을까요?",
            "투자 손실 위험을 어떻게 관리할까요?"
        );
        List<String> savingsQuestions = Arrays.asList(
            "저축 목표를 달성할 수 있을까요?",
            "효과적인 저축 방법은 무엇인가요?",
            "가계부 관리를 어떻게 해야 할까요?"
        );
        List<String> debtQuestions = Arrays.asList(
            "빚을 언제까지 갚을 수 있을까요?",
            "대출을 받아도 괜찮을까요?",
            "부채 관리 방법은 무엇인가요?"
        );
        List<String> incomeQuestions = Arrays.asList(
            "수입을 늘릴 수 있는 방법은 무엇인가요?",
            "부업이나 사이드 프로젝트가 성공할까요?",
            "연봉 협상을 어떻게 해야 할까요?"
        );
        List<String> businessQuestions = Arrays.asList(
            "사업을 시작해도 괜찮을까요?",
            "사업 아이템이 성공할 가능성은?",
            "창업 자금을 어떻게 마련해야 할까요?"
        );
        
        List<TopicResponse.Topic> moneyTopics = Arrays.asList(
            new TopicResponse.Topic("INVESTMENT", "투자", "투자에 대한 고민", investmentQuestions),
            new TopicResponse.Topic("SAVINGS", "저축", "저축에 대한 고민", savingsQuestions),
            new TopicResponse.Topic("DEBT", "부채", "빚과 대출에 대한 고민", debtQuestions),
            new TopicResponse.Topic("INCOME", "수입", "수입 증대에 대한 고민", incomeQuestions),
            new TopicResponse.Topic("BUSINESS", "사업", "사업에 대한 고민", businessQuestions)
        );
        
        categories.add(new TopicResponse.Category("MONEY", "금전", "금전과 재정에 관련된 고민", moneyTopics));
        
        return categories;
    }

    private List<ReaderResponse.Reader> initializeReaders() {
        return Arrays.asList(
            new ReaderResponse.Reader("F", "감성 리더", "감정을 중시하는 따뜻한 해석을 제공합니다", "https://example.com/reader-f.jpg"),
            new ReaderResponse.Reader("T", "이성 리더", "논리적이고 현실적인 해석을 제공합니다", "https://example.com/reader-t.jpg"),
            new ReaderResponse.Reader("FT", "균형 리더", "감성과 이성의 균형잡힌 해석을 제공합니다", "https://example.com/reader-ft.jpg")
        );
    }

    private List<TaroCard> initializeTaroCards() {
        List<TaroCard> cards = new ArrayList<>();
        int cardId = 1;

        // 메이저 아르카나 (22장)
        String[] majorArcana = {
            "바보", "마법사", "여교황", "여황제", "황제", "교황", "연인", "전차",
            "힘", "은둔자", "운명의 수레바퀴", "정의", "매달린 사람", "죽음",
            "절제", "악마", "탑", "별", "달", "태양", "심판", "세계"
        };
        String[] majorArcanaEn = {
            "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
            "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
            "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
            "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
        };
        String[] majorArcanaVideoFiles = {
            "major_arcana_fool.webm", "major_arcana_magician.webm", "major_arcana_priestess.webm",
            "major_arcana_empress.webm", "major_arcana_emperor.webm", "major_arcana_hierophant.webm",
            "major_arcana_lovers.webm", "major_arcana_chariot.webm", "major_arcana_strength.webm",
            "major_arcana_hermit.webm", "major_arcana_fortune.webm", "major_arcana_justice.webm",
            "major_arcana_hanged.webm", "major_arcana_death.webm", "major_arcana_temperance.webm",
            "major_arcana_devil.webm", "major_arcana_tower.webm", "major_arcana_star.webm",
            "major_arcana_moon.webm", "major_arcana_sun.webm", "major_arcana_judgement.webm",
            "major_arcana_world.webm"
        };

        for (int i = 0; i < majorArcana.length; i++) {
            String videoUrl = ValidationConstants.VIDEO_BASE_URL + majorArcanaVideoFiles[i];
            cards.add(new TaroCard(cardId++, majorArcana[i], majorArcanaEn[i], CardSuit.MAJOR.getCode(), String.valueOf(i + 1),
                "https://example.com/card-major-" + (i + 1) + ".jpg", videoUrl,
                "정방향: " + majorArcana[i] + "의 긍정적 의미", "역방향: " + majorArcana[i] + "의 도전적 의미"));
        }
        
        // 마이너 아르카나 (56장)
        String[] suits = {"WANDS", "CUPS", "SWORDS", "PENTACLES"};
        String[] suitNamesKo = {"완드", "컵", "소드", "펜타클"};
        String[] suitNamesEn = {"Wands", "Cups", "Swords", "Pentacles"};
        String[] suitNamesLower = {"wands", "cups", "swords", "pentacles"};
        String[] numbers = {"ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "PAGE", "KNIGHT", "QUEEN", "KING"};
        String[] numbersKo = {"에이스", "2", "3", "4", "5", "6", "7", "8", "9", "10", "페이지", "나이트", "퀸", "킹"};
        String[] numbersVideo = {"ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "page", "knight", "queen", "king"};

        for (int suitIndex = 0; suitIndex < suits.length; suitIndex++) {
            String suit = suits[suitIndex];
            String suitNameKo = suitNamesKo[suitIndex];
            String suitNameEn = suitNamesEn[suitIndex];
            String suitNameLower = suitNamesLower[suitIndex];

            for (int numIndex = 0; numIndex < numbers.length; numIndex++) {
                String number = numbers[numIndex];
                String numberKo = numbersKo[numIndex];
                String numberVideo = numbersVideo[numIndex];

                String nameKo = suitNameKo + " " + numberKo;
                String nameEn = numberKo.equals("킹") ? "King of " + suitNameEn : number + " of " + suitNameEn;

                // 비디오 URL 생성
                String videoFileName = "minor_arcana_" + suitNameLower + "_" + numberVideo + ".webm";
                String videoUrl = ValidationConstants.VIDEO_BASE_URL + videoFileName;

                cards.add(new TaroCard(cardId++, nameKo, nameEn, suit, number,
                    "https://example.com/card-" + suit.toLowerCase() + "-" + number.toLowerCase() + ".jpg", videoUrl,
                    "정방향: " + nameKo + "의 긍정적 에너지", "역방향: " + nameKo + "의 도전과 성장"));
            }
        }
        
        return cards;
    }

    public TaroReadingResponse generateTaroReading(String sessionId) {
        if (!sessionExists(sessionId)) {
            throw new SessionNotFoundException(sessionId);
        }

        try {
            Random random = new Random();
            List<TaroReadingResponse.DrawnCard> drawnCards = new ArrayList<>();
            Set<Integer> usedCards = new HashSet<>();

            for (int position = ValidationConstants.PAST_POSITION; position <= ValidationConstants.FUTURE_POSITION; position++) {
                int cardIndex;
                do {
                    cardIndex = random.nextInt(taroCards.size());
                } while (usedCards.contains(cardIndex));

                usedCards.add(cardIndex);
                TaroCard card = taroCards.get(cardIndex);
                String orientation = random.nextBoolean() ? CardOrientation.UPRIGHT.getCode() : CardOrientation.REVERSED.getCode();
                String meaning = CardOrientation.UPRIGHT.getCode().equals(orientation) ? card.getMeaningUpright() : card.getMeaningReversed();

                drawnCards.add(new TaroReadingResponse.DrawnCard(
                    position, card.getId(), card.getNameKo(), card.getNameEn(),
                    orientation, card.getVideoUrl()
                ));
            }

            return new TaroReadingResponse(sessionId, drawnCards);
        } catch (Exception e) {
            throw new TaroServiceException("Failed to generate tarot reading for session: " + sessionId, e);
        }
    }

    private String generateInterpretation(String categoryCode, String topicCode, String questionText, 
                                          List<TaroReadingResponse.DrawnCard> cards, String readerType) {
        StringBuilder interpretation = new StringBuilder();
        
        // 질문에 대한 언급
        interpretation.append("\"").append(questionText).append("\" 에 대한 타로 해석입니다.\n\n");
        
        // 카드 해석
        interpretation.append("첫 번째 카드 '").append(cards.get(0).getNameKo()).append("'는 현재 상황을 나타냅니다. ");
        interpretation.append("두 번째 카드 '").append(cards.get(1).getNameKo()).append("'는 숨겨진 영향력을 보여줍니다. ");
        interpretation.append("세 번째 카드 '").append(cards.get(2).getNameKo()).append("'는 미래의 방향을 제시합니다.\n\n");
        
        // 카테고리별 특화 메시지
        if ("LOVE".equals(categoryCode)) {
            interpretation.append("연애와 관련하여, ");
        } else if ("JOB".equals(categoryCode)) {
            interpretation.append("직업과 커리어에 관하여, ");
        } else if ("MONEY".equals(categoryCode)) {
            interpretation.append("재정과 금전에 관하여, ");
        }
        
        // 리더 타입별 해석
        if (readerType.equals("F")) {
            interpretation.append("감정적인 측면에서 볼 때, 현재 상황은 마음의 소리에 귀 기울일 시기입니다.");
        } else if (readerType.equals("T")) {
            interpretation.append("논리적으로 분석해보면, 현실적인 접근이 필요한 상황입니다.");
        } else {
            interpretation.append("종합적으로 판단할 때, 감정과 이성의 균형이 중요합니다.");
        }
        
        return interpretation.toString();
    }

    private String generateReaderMessage(String readerType) {
        if (readerType.equals("F")) {
            return "마음의 소리를 믿고 따뜻한 마음으로 상황을 바라보세요. 감정의 힘이 당신을 올바른 길로 인도할 것입니다.";
        } else if (readerType.equals("T")) {
            return "냉정하게 상황을 분석하고 현실적인 계획을 세우세요. 논리적인 접근이 성공의 열쇠입니다.";
        } else {
            return "감정과 이성의 조화를 통해 현명한 판단을 내리세요. 균형잡힌 시각이 최선의 결과를 가져다줄 것입니다.";
        }
    }

    private int generateFortuneScore() {
        Random random = new Random();
        return ValidationConstants.MIN_FORTUNE_SCORE + random.nextInt(
            ValidationConstants.MAX_FORTUNE_SCORE - ValidationConstants.MIN_FORTUNE_SCORE + 1
        );
    }

    private static class SessionData {
        final String sessionId;
        final String nickname;
        final long createdAt;

        SessionData(String sessionId, String nickname) {
            this.sessionId = sessionId;
            this.nickname = nickname;
            this.createdAt = System.currentTimeMillis();
        }

        public String getSessionId() {
            return sessionId;
        }

        public String getNickname() {
            return nickname;
        }

        public long getCreatedAt() {
            return createdAt;
        }
    }
}