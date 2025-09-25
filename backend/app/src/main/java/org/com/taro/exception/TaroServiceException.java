package org.com.taro.exception;

public class TaroServiceException extends RuntimeException {

    public TaroServiceException(String message) {
        super(message);
    }

    public TaroServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Create exception for session creation failure
     */
    public static TaroServiceException sessionCreationFailed(String reason) {
        return new TaroServiceException("세션 생성에 실패했습니다: " + reason);
    }

    /**
     * Create exception for card generation failure
     */
    public static TaroServiceException cardGenerationFailed(String sessionId) {
        return new TaroServiceException("타로 카드 생성에 실패했습니다 (세션: " + sessionId + ")");
    }

    /**
     * Create exception for result generation failure
     */
    public static TaroServiceException resultGenerationFailed(String sessionId) {
        return new TaroServiceException("타로 결과 생성에 실패했습니다 (세션: " + sessionId + ")");
    }

    /**
     * Create exception for SSE connection failure
     */
    public static TaroServiceException sseConnectionFailed(String reason) {
        return new TaroServiceException("실시간 연결에 실패했습니다: " + reason);
    }
}