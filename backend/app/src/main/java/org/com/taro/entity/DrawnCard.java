package org.com.taro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drawn_cards")
public class DrawnCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "reading_id", nullable = false)
    private Integer readingId;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Column(name = "card_id", nullable = false)
    private Integer cardId;

    @Column(name = "orientation", nullable = false)
    @Enumerated(EnumType.STRING)
    private Orientation orientation;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reading_id", referencedColumnName = "id", insertable = false, updatable = false)
    private TaroReading reading;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", referencedColumnName = "id", insertable = false, updatable = false)
    private TaroCardEntity card;

    public enum Orientation {
        upright, reversed
    }

    public DrawnCard() {}

    public DrawnCard(Integer readingId, Integer position, Integer cardId, Orientation orientation) {
        this.readingId = readingId;
        this.position = position;
        this.cardId = cardId;
        this.orientation = orientation;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getReadingId() {
        return readingId;
    }

    public void setReadingId(Integer readingId) {
        this.readingId = readingId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Integer getCardId() {
        return cardId;
    }

    public void setCardId(Integer cardId) {
        this.cardId = cardId;
    }

    public Orientation getOrientation() {
        return orientation;
    }

    public void setOrientation(Orientation orientation) {
        this.orientation = orientation;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public TaroReading getReading() {
        return reading;
    }

    public void setReading(TaroReading reading) {
        this.reading = reading;
    }

    public TaroCardEntity getCard() {
        return card;
    }

    public void setCard(TaroCardEntity card) {
        this.card = card;
    }
}