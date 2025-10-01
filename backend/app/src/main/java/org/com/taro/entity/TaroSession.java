package org.com.taro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "taro_sessions")
public class TaroSession {

    @Id
    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @Column(name = "processing_status")
    @Enumerated(EnumType.STRING)
    private ProcessingStatus processingStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Remove bidirectional mapping for now to simplify
    // @OneToMany(mappedBy = "sessionId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<TaroCardEntity> cards;

    public enum SessionStatus {
        ACTIVE, COMPLETED, CANCELLED
    }

    public enum ProcessingStatus {
        CREATED,              // 세션 생성
        CARDS_GENERATED,      // 카드 3장 생성
        SUBMITTED,            // 사용자 제출
        PAST_PROCESSING,      // 과거 카드 해석 중
        PAST_COMPLETED,       // 과거 카드 완료
        PRESENT_PROCESSING,   // 현재 카드 해석 중
        PRESENT_COMPLETED,    // 현재 카드 완료
        FUTURE_PROCESSING,    // 미래 카드 해석 중
        FUTURE_COMPLETED,     // 미래 카드 완료
        SUMMARY_PROCESSING,   // 총평 생성 중
        SUMMARY_COMPLETED,    // 총평 완료
        IMAGE_PROCESSING,     // 이미지 생성 중
        COMPLETED,           // 전체 완료
        FAILED              // 실패
    }

    // 기본 생성자
    public TaroSession() {}

    // 생성자
    public TaroSession(String sessionId, String nickname) {
        this.sessionId = sessionId;
        this.nickname = nickname;
        this.status = SessionStatus.ACTIVE;
        this.processingStatus = ProcessingStatus.CREATED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // PrePersist와 PreUpdate 콜백
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getter와 Setter
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public ProcessingStatus getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(ProcessingStatus processingStatus) {
        this.processingStatus = processingStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Remove getter/setter for cards
    // public List<TaroCardEntity> getCards() {
    //     return cards;
    // }

    // public void setCards(List<TaroCardEntity> cards) {
    //     this.cards = cards;
    // }
}