package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "세션 생성 응답")
public class SessionResponse {
    
    @Schema(description = "생성된 세션 ID", example = "abc123d")
    private String sessionId;

    public SessionResponse() {}

    public SessionResponse(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}