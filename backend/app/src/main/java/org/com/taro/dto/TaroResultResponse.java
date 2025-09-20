package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "타로 해석 결과 응답 (카드 정보 제외)")
public class TaroResultResponse {

    @Schema(description = "세션 ID")
    private String sessionId;

    @Schema(description = "처리 상태")
    private String status;

    @Schema(description = "해석 결과")
    private InterpretationsDto interpretations;

    @Schema(description = "운세 점수", example = "75")
    private Integer fortuneScore;

    @Schema(description = "결과 이미지")
    private ResultImageDto resultImage;

    public TaroResultResponse() {}

    public TaroResultResponse(String sessionId, String status, InterpretationsDto interpretations,
                              Integer fortuneScore, ResultImageDto resultImage) {
        this.sessionId = sessionId;
        this.status = status;
        this.interpretations = interpretations;
        this.fortuneScore = fortuneScore;
        this.resultImage = resultImage;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public InterpretationsDto getInterpretations() { return interpretations; }
    public void setInterpretations(InterpretationsDto interpretations) { this.interpretations = interpretations; }
    public Integer getFortuneScore() { return fortuneScore; }
    public void setFortuneScore(Integer fortuneScore) { this.fortuneScore = fortuneScore; }
    public ResultImageDto getResultImage() { return resultImage; }
    public void setResultImage(ResultImageDto resultImage) { this.resultImage = resultImage; }

    @Schema(description = "해석 결과")
    public static class InterpretationsDto {
        @Schema(description = "과거 해석")
        private String past;

        @Schema(description = "현재 해석")
        private String present;

        @Schema(description = "미래 해석")
        private String future;

        @Schema(description = "총평")
        private String summary;

        public InterpretationsDto() {}

        public InterpretationsDto(String past, String present, String future, String summary) {
            this.past = past;
            this.present = present;
            this.future = future;
            this.summary = summary;
        }

        public String getPast() { return past; }
        public void setPast(String past) { this.past = past; }
        public String getPresent() { return present; }
        public void setPresent(String present) { this.present = present; }
        public String getFuture() { return future; }
        public void setFuture(String future) { this.future = future; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }

    @Schema(description = "결과 이미지")
    public static class ResultImageDto {
        @Schema(description = "이미지 URL")
        private String url;

        @Schema(description = "이미지 설명")
        private String description;

        public ResultImageDto() {}

        public ResultImageDto(String url, String description) {
            this.url = url;
            this.description = description;
        }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}