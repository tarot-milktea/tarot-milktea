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

    @Schema(description = "요청된 카테고리 코드", example = "LOVE")
    private String categoryCode;

    @Schema(description = "요청된 주제 코드", example = "REUNION")
    private String topicCode;

    @Schema(description = "요청된 질문 텍스트", example = "전 연인과 재회할 가능성이 있을까요?")
    private String questionText;

    @Schema(description = "요청된 리더 타입", example = "F")
    private String readerType;

    public SubmitResultResponse() {}

    public SubmitResultResponse(boolean success, String message, String sessionId) {
        this.success = success;
        this.message = message;
        this.sessionId = sessionId;
    }

    public SubmitResultResponse(boolean success, String message, String sessionId,
                                String categoryCode, String topicCode, String questionText, String readerType) {
        this.success = success;
        this.message = message;
        this.sessionId = sessionId;
        this.categoryCode = categoryCode;
        this.topicCode = topicCode;
        this.questionText = questionText;
        this.readerType = readerType;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
    public String getTopicCode() { return topicCode; }
    public void setTopicCode(String topicCode) { this.topicCode = topicCode; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getReaderType() { return readerType; }
    public void setReaderType(String readerType) { this.readerType = readerType; }
}