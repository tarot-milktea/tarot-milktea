package org.com.taro.enums;

/**
 * Processing status enum for tarot reading sessions
 * 타로 리딩 세션의 처리 상태 enum
 */
public enum ProcessingStatus {
    // Early processing statuses (425 Too Early should be returned)
    // 초기 처리 상태 (425 Too Early 반환 대상)
    CREATED("CREATED", "세션 생성됨", StatusGroup.EARLY),
    CARDS_GENERATED("CARDS_GENERATED", "카드 3장 생성됨", StatusGroup.EARLY),
    SUBMITTED("SUBMITTED", "사용자 제출됨", StatusGroup.EARLY),

    // Active processing statuses (200 OK with processing info)
    // 활성 처리 상태 (200 OK와 처리 정보 반환)
    PAST_PROCESSING("PAST_PROCESSING", "과거 카드 해석 중", StatusGroup.PROCESSING),
    PAST_COMPLETED("PAST_COMPLETED", "과거 카드 해석 완료", StatusGroup.PROCESSING),
    PRESENT_PROCESSING("PRESENT_PROCESSING", "현재 카드 해석 중", StatusGroup.PROCESSING),
    PRESENT_COMPLETED("PRESENT_COMPLETED", "현재 카드 해석 완료", StatusGroup.PROCESSING),
    FUTURE_PROCESSING("FUTURE_PROCESSING", "미래 카드 해석 중", StatusGroup.PROCESSING),
    FUTURE_COMPLETED("FUTURE_COMPLETED", "미래 카드 해석 완료", StatusGroup.PROCESSING),
    SUMMARY_PROCESSING("SUMMARY_PROCESSING", "총평 생성 중", StatusGroup.PROCESSING),
    SUMMARY_COMPLETED("SUMMARY_COMPLETED", "총평 생성 완료", StatusGroup.PROCESSING),
    IMAGE_PROCESSING("IMAGE_PROCESSING", "이미지 생성 중", StatusGroup.PROCESSING),

    // Final statuses (process completed)
    // 최종 상태 (처리 완료)
    COMPLETED("COMPLETED", "전체 완료", StatusGroup.FINAL),
    FAILED("FAILED", "실패", StatusGroup.FINAL);

    private final String code;
    private final String description;
    private final StatusGroup group;

    ProcessingStatus(String code, String description, StatusGroup group) {
        this.code = code;
        this.description = description;
        this.group = group;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public StatusGroup getGroup() {
        return group;
    }

    /**
     * Check if this status is in early processing stage (425 should be returned)
     * 초기 처리 단계 인지 확인 (425 에러 반환 대상)
     */
    public boolean isEarlyProcessing() {
        return this.group == StatusGroup.EARLY;
    }

    /**
     * Check if this status is in active processing stage
     * 활성 처리 단계 인지 확인
     */
    public boolean isActiveProcessing() {
        return this.group == StatusGroup.PROCESSING;
    }

    /**
     * Check if this status is final (completed or failed)
     * 최종 상태인지 확인 (완료 또는 실패)
     */
    public boolean isFinal() {
        return this.group == StatusGroup.FINAL;
    }

    /**
     * Get ProcessingStatus from string code
     * 문자열 코드로부터 ProcessingStatus 획득
     */
    public static ProcessingStatus fromCode(String code) {
        if (code == null) {
            return null;
        }

        for (ProcessingStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    /**
     * Static helper methods for backward compatibility
     * 하위 호환성을 위한 정적 헬퍼 메서드
     */
    public static boolean isEarlyProcessingStatus(String statusCode) {
        ProcessingStatus status = fromCode(statusCode);
        return status != null && status.isEarlyProcessing();
    }

    public static boolean isActiveProcessingStatus(String statusCode) {
        ProcessingStatus status = fromCode(statusCode);
        return status != null && status.isActiveProcessing();
    }

    public static boolean isFinalStatus(String statusCode) {
        ProcessingStatus status = fromCode(statusCode);
        return status != null && status.isFinal();
    }

    /**
     * Status grouping for validation
     * 검증을 위한 상태 그룹화
     */
    private enum StatusGroup {
        EARLY,      // 초기 처리 상태
        PROCESSING, // 활성 처리 상태
        FINAL       // 최종 상태
    }

    @Override
    public String toString() {
        return code;
    }
}