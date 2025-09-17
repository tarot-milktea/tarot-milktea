package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "최종 선택 결과 전송 요청",
        example = "{\n" +
                  "  \"categoryCode\": \"LOVE\",\n" +
                  "  \"topicCode\": \"REUNION\",\n" +
                  "  \"questionText\": \"전 연인과 재회할 가능성이 있을까요?\",\n" +
                  "  \"readerType\": \"F\"\n" +
                  "}")
public class SubmitRequest {
    
    @Schema(description = "선택한 카테고리 코드", example = "LOVE")
    @NotBlank(message = "카테고리 코드는 필수입니다")
    @Pattern(regexp = "^(LOVE|JOB|MONEY)$", message = "유효하지 않은 카테고리 코드입니다. 사용 가능한 값: LOVE, JOB, MONEY")
    private String categoryCode;
    
    @Schema(description = "선택한 주제 코드", example = "REUNION")
    @NotBlank(message = "주제 코드는 필수입니다")
    private String topicCode;
    
    @Schema(description = "사용자가 입력한 질문", example = "전 연인과 재회할 가능성이 있을까요?")
    @NotBlank(message = "질문 텍스트는 필수입니다")
    @Size(max = 200, message = "질문은 200자 이하로 입력해주세요")
    private String questionText;
    
    @Schema(description = "선택한 리더 타입", example = "F")
    @NotBlank(message = "리더 타입은 필수입니다")
    @Pattern(regexp = "^(F|T|FT)$", message = "유효하지 않은 리더 타입입니다. 사용 가능한 값: F, T, FT")
    private String readerType;
    

    public SubmitRequest() {}

    public SubmitRequest(String categoryCode, String topicCode, String questionText, String readerType) {
        this.categoryCode = categoryCode;
        this.topicCode = topicCode;
        this.questionText = questionText;
        this.readerType = readerType;
    }

    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
    public String getTopicCode() { return topicCode; }
    public void setTopicCode(String topicCode) { this.topicCode = topicCode; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getReaderType() { return readerType; }
    public void setReaderType(String readerType) { this.readerType = readerType; }

}