package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "타로 결과 응답")
public class TaroResultResponse {
    
    @Schema(description = "세션 ID")
    private String sessionId;
    
    @Schema(description = "뽑힌 카드 목록")
    private List<DrawnCard> cards;
    
    @Schema(description = "전체 해석")
    private String interpretation;
    
    @Schema(description = "리더 메시지")
    private String readerMessage;
    
    @Schema(description = "운세 점수", example = "85")
    private int fortuneScore;
    
    @Schema(description = "결과 이미지 URL")
    private String resultImageUrl;

    public TaroResultResponse() {}

    public TaroResultResponse(String sessionId, List<DrawnCard> cards, String interpretation, 
                              String readerMessage, int fortuneScore, String resultImageUrl) {
        this.sessionId = sessionId;
        this.cards = cards;
        this.interpretation = interpretation;
        this.readerMessage = readerMessage;
        this.fortuneScore = fortuneScore;
        this.resultImageUrl = resultImageUrl;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public List<DrawnCard> getCards() { return cards; }
    public void setCards(List<DrawnCard> cards) { this.cards = cards; }
    public String getInterpretation() { return interpretation; }
    public void setInterpretation(String interpretation) { this.interpretation = interpretation; }
    public String getReaderMessage() { return readerMessage; }
    public void setReaderMessage(String readerMessage) { this.readerMessage = readerMessage; }
    public int getFortuneScore() { return fortuneScore; }
    public void setFortuneScore(int fortuneScore) { this.fortuneScore = fortuneScore; }
    public String getResultImageUrl() { return resultImageUrl; }
    public void setResultImageUrl(String resultImageUrl) { this.resultImageUrl = resultImageUrl; }

    @Schema(description = "뽑힌 카드 정보")
    public static class DrawnCard {
        @Schema(description = "카드 위치", example = "1")
        private int position;
        
        @Schema(description = "카드 ID", example = "1")
        private int cardId;
        
        @Schema(description = "카드명 (한글)", example = "바보")
        private String nameKo;
        
        @Schema(description = "카드명 (영문)", example = "The Fool")
        private String nameEn;
        
        @Schema(description = "카드 방향", example = "upright")
        private String orientation;
        
        @Schema(description = "카드 이미지 URL")
        private String imageUrl;
        
        @Schema(description = "카드 의미")
        private String meaning;

        public DrawnCard() {}

        public DrawnCard(int position, int cardId, String nameKo, String nameEn, 
                         String orientation, String imageUrl, String meaning) {
            this.position = position;
            this.cardId = cardId;
            this.nameKo = nameKo;
            this.nameEn = nameEn;
            this.orientation = orientation;
            this.imageUrl = imageUrl;
            this.meaning = meaning;
        }

        public int getPosition() { return position; }
        public void setPosition(int position) { this.position = position; }
        public int getCardId() { return cardId; }
        public void setCardId(int cardId) { this.cardId = cardId; }
        public String getNameKo() { return nameKo; }
        public void setNameKo(String nameKo) { this.nameKo = nameKo; }
        public String getNameEn() { return nameEn; }
        public void setNameEn(String nameEn) { this.nameEn = nameEn; }
        public String getOrientation() { return orientation; }
        public void setOrientation(String orientation) { this.orientation = orientation; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getMeaning() { return meaning; }
        public void setMeaning(String meaning) { this.meaning = meaning; }
    }
}