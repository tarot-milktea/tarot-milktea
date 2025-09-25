package org.com.taro.constants;

/**
 * Technical constants for validation and configuration.
 * Business logic constants now managed by database through ReferenceDataService.
 *
 * 기술적 상수들만 관리합니다.
 * 비즈니스 로직 상수들은 이제 ReferenceDataService를 통해 데이터베이스에서 관리됩니다.
 */
public final class ValidationConstants {

    // Session constants - 세션 관련 상수
    public static final int SESSION_ID_LENGTH = 7; // 세션 ID 길이
    public static final String SESSION_ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"; // 세션 ID 생성에 사용할 문자

    // Question text validation - 질문 텍스트 검증
    public static final int MAX_QUESTION_LENGTH = 200; // 질문 텍스트 최대 길이

    // Tarot reading constants - 타로 리딩 상수
    public static final int REQUIRED_CARD_COUNT = 3; // 필요한 카드 수
    public static final int PAST_POSITION = 1; // 과거 카드 위치
    public static final int PRESENT_POSITION = 2; // 현재 카드 위치
    public static final int FUTURE_POSITION = 3; // 미래 카드 위치

    // Fortune score range - 운세 점수 범위
    public static final int MIN_FORTUNE_SCORE = 60; // 최소 운세 점수
    public static final int MAX_FORTUNE_SCORE = 99; // 최대 운세 점수

    // Video URL base - 동영상 URL 베이스
    public static final String VIDEO_BASE_URL = "https://j13a601.p.ssafy.io/media/"; // 카드 동영상 베이스 URL

    // Timeframe constants - 시간대 상수
    public static final String TIMEFRAME_PAST = "과거"; // 과거
    public static final String TIMEFRAME_PRESENT = "현재"; // 현재
    public static final String TIMEFRAME_FUTURE = "미래"; // 미래

    private ValidationConstants() {
        // Utility class - prevent instantiation (유틸리티 클래스 - 인스턴스 생성 방지)
    }
}