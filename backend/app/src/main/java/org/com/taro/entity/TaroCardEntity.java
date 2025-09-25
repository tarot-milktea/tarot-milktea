package org.com.taro.entity;

import jakarta.persistence.*;
import org.com.taro.enums.CardSuit;

@Entity
@Table(name = "taro_cards")
public class TaroCardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "card_id", unique = true, nullable = false)
    private Integer cardId;

    @Column(name = "name_ko", nullable = false)
    private String nameKo;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "suit", nullable = false)
    @Enumerated(EnumType.STRING)
    private CardSuit suit;

    @Column(name = "number")
    private String number;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "meaning_upright", columnDefinition = "TEXT")
    private String meaningUpright;

    @Column(name = "meaning_reversed", columnDefinition = "TEXT")
    private String meaningReversed;

    // 기본 생성자
    public TaroCardEntity() {}

    // 생성자
    public TaroCardEntity(Integer cardId, String nameKo, String nameEn, CardSuit suit, String number,
                         String imageUrl, String videoUrl, String meaningUpright, String meaningReversed) {
        this.cardId = cardId;
        this.nameKo = nameKo;
        this.nameEn = nameEn;
        this.suit = suit;
        this.number = number;
        this.imageUrl = imageUrl;
        this.videoUrl = videoUrl;
        this.meaningUpright = meaningUpright;
        this.meaningReversed = meaningReversed;
    }

    // Getter와 Setter
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCardId() {
        return cardId;
    }

    public void setCardId(Integer cardId) {
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

    public CardSuit getSuit() {
        return suit;
    }

    public void setSuit(CardSuit suit) {
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