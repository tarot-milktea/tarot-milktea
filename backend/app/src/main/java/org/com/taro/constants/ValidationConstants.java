package org.com.taro.constants;

public final class ValidationConstants {

    // Session constants
    public static final int SESSION_ID_LENGTH = 7;
    public static final String SESSION_ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Question text validation
    public static final int MAX_QUESTION_LENGTH = 200;

    // Tarot reading constants
    public static final int REQUIRED_CARD_COUNT = 3;
    public static final int PAST_POSITION = 1;
    public static final int PRESENT_POSITION = 2;
    public static final int FUTURE_POSITION = 3;

    // Card orientation values
    public static final String ORIENTATION_UPRIGHT = "upright";
    public static final String ORIENTATION_REVERSED = "reversed";

    // Valid card suits
    public static final String SUIT_MAJOR = "MAJOR";
    public static final String SUIT_WANDS = "WANDS";
    public static final String SUIT_CUPS = "CUPS";
    public static final String SUIT_SWORDS = "SWORDS";
    public static final String SUIT_PENTACLES = "PENTACLES";

    // Valid reader types
    public static final String READER_TYPE_F = "F";
    public static final String READER_TYPE_T = "T";
    public static final String READER_TYPE_FT = "FT";

    // Category codes
    public static final String CATEGORY_LOVE = "LOVE";
    public static final String CATEGORY_JOB = "JOB";
    public static final String CATEGORY_MONEY = "MONEY";

    // Fortune score range
    public static final int MIN_FORTUNE_SCORE = 60;
    public static final int MAX_FORTUNE_SCORE = 99;

    // Video URL base
    public static final String VIDEO_BASE_URL = "https://j13a601.p.ssafy.io/media/";

    private ValidationConstants() {
        // Utility class - prevent instantiation
    }
}