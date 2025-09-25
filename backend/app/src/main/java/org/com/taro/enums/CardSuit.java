package org.com.taro.enums;

/**
 * Card suit enum for tarot cards
 * 타로 카드 슈트 enum
 */
public enum CardSuit {
    MAJOR("MAJOR", "메이저 아르카나", "Major Arcana cards representing major life events"),
    WANDS("WANDS", "완드 (지팡이)", "Suit of Wands representing creativity and passion"),
    CUPS("CUPS", "컵", "Suit of Cups representing emotions and relationships"),
    SWORDS("SWORDS", "소드 (검)", "Suit of Swords representing conflict and intellect"),
    PENTACLES("PENTACLES", "펜타클 (동전)", "Suit of Pentacles representing material matters");

    private final String code;
    private final String koreanName;
    private final String description;

    CardSuit(String code, String koreanName, String description) {
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
     * Get CardSuit from string code
     * 문자열 코드로부터 CardSuit 획득
     */
    public static CardSuit fromCode(String code) {
        if (code == null) {
            return null;
        }

        for (CardSuit suit : values()) {
            if (suit.code.equals(code)) {
                return suit;
            }
        }
        return null;
    }

    /**
     * Check if this suit is Major Arcana
     * 이 슈트가 메이저 아르카나인지 확인
     */
    public boolean isMajorArcana() {
        return this == MAJOR;
    }

    /**
     * Check if this suit is Minor Arcana
     * 이 슈트가 마이너 아르카나인지 확인
     */
    public boolean isMinorArcana() {
        return this != MAJOR;
    }

    @Override
    public String toString() {
        return code;
    }
}