package org.com.taro.enums;

/**
 * Session status enum for tarot reading sessions
 * 타로 리딩 세션의 세션 상태 enum
 */
public enum SessionStatus {
    ACTIVE("ACTIVE", "활성 세션"),
    COMPLETED("COMPLETED", "완료된 세션"),
    CANCELLED("CANCELLED", "취소된 세션");

    private final String code;
    private final String description;

    SessionStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Get SessionStatus from string code
     * 문자열 코드로부터 SessionStatus 획득
     */
    public static SessionStatus fromCode(String code) {
        if (code == null) {
            return null;
        }

        for (SessionStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    /**
     * Check if session is active
     * 세션이 활성 상태인지 확인
     */
    public boolean isActive() {
        return this == ACTIVE;
    }

    /**
     * Check if session is completed (either completed or cancelled)
     * 세션이 완료 상태인지 확인 (완료 또는 취소)
     */
    public boolean isCompleted() {
        return this == COMPLETED || this == CANCELLED;
    }

    @Override
    public String toString() {
        return code;
    }
}