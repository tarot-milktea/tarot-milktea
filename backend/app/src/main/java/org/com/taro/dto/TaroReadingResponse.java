package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "타로 카드 3장 리딩 응답")
public class TaroReadingResponse {
    @Schema(description = "세션 ID", example = "abc123d")
    private String sessionId;

    @Schema(description = "뽑힌 카드 3장 (과거, 현재, 미래)")
    private List<DrawnCard> cards;

    public TaroReadingResponse() {}

    public TaroReadingResponse(String sessionId, List<DrawnCard> cards) {
        this.sessionId = sessionId;
        this.cards = cards;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public List<DrawnCard> getCards() {
        return cards;
    }

    public void setCards(List<DrawnCard> cards) {
        this.cards = cards;
    }

    @Schema(description = "뽑힌 카드 정보")
    public static class DrawnCard {
        @Schema(description = "카드 위치 (1: 과거, 2: 현재, 3: 미래)", example = "1")
        private int position;

        @Schema(description = "카드 ID", example = "1")
        private int cardId;

        @Schema(description = "카드 이름 (한국어)", example = "바보")
        private String nameKo;

        @Schema(description = "카드 이름 (영어)", example = "The Fool")
        private String nameEn;

        @Schema(description = "카드 방향", example = "upright", allowableValues = {"upright", "reversed"})
        private String orientation;

        @Schema(description = "카드 비디오 URL", example = "https://j13a601.p.ssafy.io/media/major_arcana_fool.webm")
        private String videoUrl;

        public DrawnCard() {}

        public DrawnCard(int position, int cardId, String nameKo, String nameEn,
                        String orientation, String videoUrl) {
            this.position = position;
            this.cardId = cardId;
            this.nameKo = nameKo;
            this.nameEn = nameEn;
            this.orientation = orientation;
            this.videoUrl = videoUrl;
        }

        public int getPosition() {
            return position;
        }

        public void setPosition(int position) {
            this.position = position;
        }

        public int getCardId() {
            return cardId;
        }

        public void setCardId(int cardId) {
            this.cardId = cardId;
        }

        public String getNameKo() {
            return nameKo;
        }

        public void setNameKo(String nameKo) {
            this.nameKo = nameKo;
        }

        public String getNameEn() {
            return nameEn;
        }

        public void setNameEn(String nameEn) {
            this.nameEn = nameEn;
        }

        public String getOrientation() {
            return orientation;
        }

        public void setOrientation(String orientation) {
            this.orientation = orientation;
        }

        public String getVideoUrl() {
            return videoUrl;
        }

        public void setVideoUrl(String videoUrl) {
            this.videoUrl = videoUrl;
        }
    }
}