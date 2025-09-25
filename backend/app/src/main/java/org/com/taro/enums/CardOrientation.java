package org.com.taro.enums;

/**
 * Card orientation enum for tarot cards
 * 타로 카드 방향 enum
 */
public enum CardOrientation {
    UPRIGHT("upright", "정방향", "카드가 정상 방향으로 놓인 상태"),
    REVERSED("reversed", "역방향", "카드가 뒤집혀진 상태");

    private final String code;
    private final String koreanName;
    private final String description;

    CardOrientation(String code, String koreanName, String description) {
        this.code = code;
        this.koreanName = koreanName;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getKoreanName() {
        return koreanName;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Get CardOrientation from string code
     * 문자열 코드로부터 CardOrientation 획득
     */
    public static CardOrientation fromCode(String code) {
        if (code == null) {
            return null;
        }

        for (CardOrientation orientation : values()) {
            if (orientation.code.equals(code)) {
                return orientation;
            }
        }
        return null;
    }

    /**
     * Check if this orientation is upright
     * 이 방향이 정방향인지 확인
     */
    public boolean isUpright() {
        return this == UPRIGHT;
    }

    /**
     * Check if this orientation is reversed
     * 이 방향이 역방향인지 확인
     */
    public boolean isReversed() {
        return this == REVERSED;
    }

    @Override
    public String toString() {
        return code;
    }
}