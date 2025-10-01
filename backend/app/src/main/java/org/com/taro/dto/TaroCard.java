package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "타로 카드 정보")
public class TaroCard {
    @Schema(description = "카드 ID", example = "1")
    private int id;

    @Schema(description = "카드 이름 (한국어)", example = "바보")
    private String nameKo;

    @Schema(description = "카드 이름 (영어)", example = "The Fool")
    private String nameEn;

    @Schema(description = "카드 슈트", example = "MAJOR", allowableValues = {"MAJOR", "WANDS", "CUPS", "SWORDS", "PENTACLES"})
    private String suit;

    @Schema(description = "카드 번호", example = "1")
    private String number;

    @Schema(description = "카드 이미지 URL", example = "https://example.com/card-major-1.jpg")
    private String imageUrl;

    @Schema(description = "카드 비디오 URL", example = "https://j13a601.p.ssafy.io/media/major_arcana_fool.webm")
    private String videoUrl;

    @Schema(description = "정방향 의미", example = "정방향: 바보의 긍정적 의미")
    private String meaningUpright;

    @Schema(description = "역방향 의미", example = "역방향: 바보의 도전적 의미")
    private String meaningReversed;

    public TaroCard() {}

    public TaroCard(int id, String nameKo, String nameEn, String suit, String number,
                    String imageUrl, String videoUrl, String meaningUpright, String meaningReversed) {
        this.id = id;
        this.nameKo = nameKo;
        this.nameEn = nameEn;
        this.suit = suit;
        this.number = number;
        this.imageUrl = imageUrl;
        this.videoUrl = videoUrl;
        this.meaningUpright = meaningUpright;
        this.meaningReversed = meaningReversed;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getSuit() {
        return suit;
    }

    public void setSuit(String suit) {
        this.suit = suit;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getMeaningUpright() {
        return meaningUpright;
    }

    public void setMeaningUpright(String meaningUpright) {
        this.meaningUpright = meaningUpright;
    }

    public String getMeaningReversed() {
        return meaningReversed;
    }

    public void setMeaningReversed(String meaningReversed) {
        this.meaningReversed = meaningReversed;
    }
}