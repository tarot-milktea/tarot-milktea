package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "선택 결과 전송 응답")
public class SubmitResultResponse {

    @Schema(description = "생성 성공 여부", example = "true")
    private boolean success;

    @Schema(description = "응답 메시지", example = "타로 결과가 성공적으로 생성되었습니다")
    private String message;

    @Schema(description = "세션 ID", example = "session123")
    private String sessionId;

    public SubmitResultResponse() {}

    public SubmitResultResponse(boolean success, String message, String sessionId) {
        this.success = success;
        this.message = message;
        this.sessionId = sessionId;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}