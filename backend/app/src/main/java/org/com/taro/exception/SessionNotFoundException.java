package org.com.taro.exception;

public class SessionNotFoundException extends RuntimeException {

    private final String sessionId;

    public SessionNotFoundException(String sessionId) {
        super("세션을 찾을 수 없습니다: " + sessionId);
        this.sessionId = sessionId;
    }

    public SessionNotFoundException(String sessionId, Throwable cause) {
        super("세션을 찾을 수 없습니다: " + sessionId, cause);
        this.sessionId = sessionId;
    }

    public String getSessionId() {
        return sessionId;
    }
}