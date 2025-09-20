package org.com.taro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "taro_readings")
public class TaroReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "session_id", length = 50, nullable = false)
    private String sessionId;

    @Column(name = "category_code", length = 20, nullable = true)
    private String categoryCode;

    @Column(name = "topic_code", length = 20, nullable = true)
    private String topicCode;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = true)
    private String questionText;

    @Column(name = "reader_type", length = 10, nullable = true)
    private String readerType;

    @Column(name = "past_interpretation", columnDefinition = "TEXT")
    private String pastInterpretation;

    @Column(name = "present_interpretation", columnDefinition = "TEXT")
    private String presentInterpretation;

    @Column(name = "future_interpretation", columnDefinition = "TEXT")
    private String futureInterpretation;

    @Column(name = "interpretation", columnDefinition = "TEXT")
    private String interpretation;


    @Column(name = "fortune_score")
    private Integer fortuneScore;

    @Column(name = "result_image_url", length = 500)
    private String resultImageUrl;

    @Column(name = "result_image_text", columnDefinition = "TEXT")
    private String resultImageText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", referencedColumnName = "session_id", insertable = false, updatable = false)
    private TaroSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_code", referencedColumnName = "code", insertable = false, updatable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_code", referencedColumnName = "code", insertable = false, updatable = false)
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reader_type", referencedColumnName = "type", insertable = false, updatable = false)
    private Reader reader;

    @OneToMany(mappedBy = "reading", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DrawnCard> drawnCards;

    public TaroReading() {}

    public TaroReading(String sessionId, String categoryCode, String topicCode,
                      String questionText, String readerType) {
        this.sessionId = sessionId;
        this.categoryCode = categoryCode;
        this.topicCode = topicCode;
        this.questionText = questionText;
        this.readerType = readerType;
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

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public String getTopicCode() {
        return topicCode;
    }

    public void setTopicCode(String topicCode) {
        this.topicCode = topicCode;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getReaderType() {
        return readerType;
    }

    public void setReaderType(String readerType) {
        this.readerType = readerType;
    }

    public String getPastInterpretation() {
        return pastInterpretation;
    }

    public void setPastInterpretation(String pastInterpretation) {
        this.pastInterpretation = pastInterpretation;
    }

    public String getPresentInterpretation() {
        return presentInterpretation;
    }

    public void setPresentInterpretation(String presentInterpretation) {
        this.presentInterpretation = presentInterpretation;
    }

    public String getFutureInterpretation() {
        return futureInterpretation;
    }

    public void setFutureInterpretation(String futureInterpretation) {
        this.futureInterpretation = futureInterpretation;
    }

    public String getInterpretation() {
        return interpretation;
    }

    public void setInterpretation(String interpretation) {
        this.interpretation = interpretation;
    }


    public Integer getFortuneScore() {
        return fortuneScore;
    }

    public void setFortuneScore(Integer fortuneScore) {
        this.fortuneScore = fortuneScore;
    }

    public String getResultImageUrl() {
        return resultImageUrl;
    }

    public void setResultImageUrl(String resultImageUrl) {
        this.resultImageUrl = resultImageUrl;
    }

    public String getResultImageText() {
        return resultImageText;
    }

    public void setResultImageText(String resultImageText) {
        this.resultImageText = resultImageText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public TaroSession getSession() {
        return session;
    }

    public void setSession(TaroSession session) {
        this.session = session;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public Reader getReader() {
        return reader;
    }

    public void setReader(Reader reader) {
        this.reader = reader;
    }

    public List<DrawnCard> getDrawnCards() {
        return drawnCards;
    }

    public void setDrawnCards(List<DrawnCard> drawnCards) {
        this.drawnCards = drawnCards;
    }
}