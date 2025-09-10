package org.com.taro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "에러 응답")
public class ErrorResponse {
    
    @Schema(description = "에러 코드", example = "500")
    private int code;
    
    @Schema(description = "에러 메시지", example = "세션 생성에 실패했습니다")
    private String message;
    
    @Schema(description = "상세 메시지", example = "서버 내부 오류로 세션을 생성할 수 없습니다")
    private String detail;
    
    @Schema(description = "에러 발생 시간")
    private LocalDateTime timestamp;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(int code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(int code, String message, String detail) {
        this.code = code;
        this.message = message;
        this.detail = detail;
        this.timestamp = LocalDateTime.now();
    }

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}