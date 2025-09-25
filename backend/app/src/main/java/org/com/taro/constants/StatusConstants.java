package org.com.taro.constants;

import org.com.taro.enums.ProcessingStatus;
import org.com.taro.enums.SessionStatus;

/**
 * @deprecated Use {@link ProcessingStatus} and {@link SessionStatus} enums instead.
 * This class is kept for backward compatibility only.
 *
 * 이 클래스 대신 {@link ProcessingStatus}와 {@link SessionStatus} enum을 사용하세요.
 * 이 클래스는 하위 호환성을 위해서만 유지됩니다.
 */
@Deprecated
public final class StatusConstants {

    // ProcessingStatus constants - 처리 상태 상수 (Use ProcessingStatus enum instead)
    public static final String STATUS_CREATED = ProcessingStatus.CREATED.getCode();
    public static final String STATUS_CARDS_GENERATED = ProcessingStatus.CARDS_GENERATED.getCode();
    public static final String STATUS_SUBMITTED = ProcessingStatus.SUBMITTED.getCode();
    public static final String STATUS_PAST_PROCESSING = ProcessingStatus.PAST_PROCESSING.getCode();
    public static final String STATUS_PAST_COMPLETED = ProcessingStatus.PAST_COMPLETED.getCode();
    public static final String STATUS_PRESENT_PROCESSING = ProcessingStatus.PRESENT_PROCESSING.getCode();
    public static final String STATUS_PRESENT_COMPLETED = ProcessingStatus.PRESENT_COMPLETED.getCode();
    public static final String STATUS_FUTURE_PROCESSING = ProcessingStatus.FUTURE_PROCESSING.getCode();
    public static final String STATUS_FUTURE_COMPLETED = ProcessingStatus.FUTURE_COMPLETED.getCode();
    public static final String STATUS_SUMMARY_PROCESSING = ProcessingStatus.SUMMARY_PROCESSING.getCode();
    public static final String STATUS_SUMMARY_COMPLETED = ProcessingStatus.SUMMARY_COMPLETED.getCode();
    public static final String STATUS_IMAGE_PROCESSING = ProcessingStatus.IMAGE_PROCESSING.getCode();
    public static final String STATUS_COMPLETED = ProcessingStatus.COMPLETED.getCode();
    public static final String STATUS_FAILED = ProcessingStatus.FAILED.getCode();

    // SessionStatus constants - 세션 상태 상수 (Use SessionStatus enum instead)
    public static final String SESSION_ACTIVE = SessionStatus.ACTIVE.getCode();
    public static final String SESSION_COMPLETED = SessionStatus.COMPLETED.getCode();
    public static final String SESSION_CANCELLED = SessionStatus.CANCELLED.getCode();

    /**
     * @deprecated Use {@link ProcessingStatus#isEarlyProcessingStatus(String)} instead.
     * Check if status is in early processing stage (425 should be returned)
     * 초기 처리 단계 인지 확인 (425 에러 반환 대상)
     */
    @Deprecated
    public static boolean isEarlyProcessingStatus(String status) {
        return ProcessingStatus.isEarlyProcessingStatus(status);
    }

    /**
     * @deprecated Use {@link ProcessingStatus#isActiveProcessingStatus(String)} instead.
     * Check if status is in active processing stage
     * 활성 처리 단계 인지 확인
     */
    @Deprecated
    public static boolean isActiveProcessingStatus(String status) {
        return ProcessingStatus.isActiveProcessingStatus(status);
    }

    /**
     * @deprecated Use {@link ProcessingStatus#isFinalStatus(String)} instead.
     * Check if status is final (completed or failed)
     * 최종 상태인지 확인 (완료 또는 실패)
     */
    @Deprecated
    public static boolean isFinalStatus(String status) {
        return ProcessingStatus.isFinalStatus(status);
    }

    private StatusConstants() {
        // Utility class - prevent instantiation (유틸리티 클래스 - 인스턴스 생성 방지)
    }
}