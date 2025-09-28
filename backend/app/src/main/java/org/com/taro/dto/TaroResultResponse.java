package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "타로 해석 결과 응답")
public class TaroResultResponse {

    @Schema(description = "세션 ID")
    private String sessionId;

    @Schema(description = "닉네임")
    private String nickname;

    @Schema(description = "질문 텍스트")
    private String questionText;

    @Schema(description = "리더 타입")
    private String readerType;

    @Schema(description = "처리 상태")
    private String status;

    @Schema(description = "해석 결과")
    private InterpretationsDto interpretations;

    @Schema(description = "뽑힌 카드 목록 (과거, 현재, 미래)")
    private List<TaroReadingResponse.DrawnCard> drawnCards;

    @Schema(description = "운세 점수", example = "75")
    private Integer fortuneScore;

    @Schema(description = "행운 카드")
    private LuckyCardDto luckyCard;

    public TaroResultResponse() {}

    public TaroResultResponse(String sessionId, String nickname, String questionText, String readerType, String status, InterpretationsDto interpretations,
                              List<TaroReadingResponse.DrawnCard> drawnCards,
                              Integer fortuneScore, LuckyCardDto luckyCard) {
        this.sessionId = sessionId;
        this.nickname = nickname;
        this.questionText = questionText;
        this.readerType = readerType;
        this.status = status;
        this.interpretations = interpretations;
        this.drawnCards = drawnCards;
        this.fortuneScore = fortuneScore;
        this.luckyCard = luckyCard;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getReaderType() { return readerType; }
    public void setReaderType(String readerType) { this.readerType = readerType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public InterpretationsDto getInterpretations() { return interpretations; }
    public void setInterpretations(InterpretationsDto interpretations) { this.interpretations = interpretations; }
    public List<TaroReadingResponse.DrawnCard> getDrawnCards() { return drawnCards; }
    public void setDrawnCards(List<TaroReadingResponse.DrawnCard> drawnCards) { this.drawnCards = drawnCards; }
    public Integer getFortuneScore() { return fortuneScore; }
    public void setFortuneScore(Integer fortuneScore) { this.fortuneScore = fortuneScore; }
    public LuckyCardDto getLuckyCard() { return luckyCard; }
    public void setLuckyCard(LuckyCardDto luckyCard) { this.luckyCard = luckyCard; }

    @Schema(description = "해석 결과")
    public static class InterpretationsDto {
        @Schema(description = "과거 해석")
        private String past;

        @Schema(description = "현재 해석")
        private String present;

        @Schema(description = "미래 해석")
        private String future;

        @Schema(description = "총평")
        private String summary;

        public InterpretationsDto() {}

        public InterpretationsDto(String past, String present, String future, String summary) {
            this.past = past;
            this.present = present;
            this.future = future;
            this.summary = summary;
        }

        public String getPast() { return past; }
        public void setPast(String past) { this.past = past; }
        public String getPresent() { return present; }
        public void setPresent(String present) { this.present = present; }
        public String getFuture() { return future; }
        public void setFuture(String future) { this.future = future; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }

    @Schema(description = "행운 카드")
    public static class LuckyCardDto {
        @Schema(description = "카드 이름")
        private String name;

        @Schema(description = "카드 메시지")
        private String message;

        @Schema(description = "카드 이미지 URL")
        private String imageUrl;

        public LuckyCardDto() {}

        public LuckyCardDto(String name, String message, String imageUrl) {
            this.name = name;
            this.message = message;
            this.imageUrl = imageUrl;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}