package org.com.taro.exception;

public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }

    public InvalidRequestException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Create exception for invalid session ID
     */
    public static InvalidRequestException invalidSessionId() {
        return new InvalidRequestException("세션 ID는 필수입니다");
    }

    /**
     * Create exception for missing required fields
     */
    public static InvalidRequestException missingRequiredFields() {
        return new InvalidRequestException("필수 필드가 누락되었습니다: categoryCode, topicCode, questionText, readerType는 모두 필수입니다");
    }
}