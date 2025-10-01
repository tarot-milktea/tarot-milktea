package org.com.taro.exception;

import org.com.taro.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle InvalidRequestException - 400 Bad Request
     */
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequest(InvalidRequestException ex, WebRequest request) {
        logger.warn("Invalid request: {} for {}", ex.getMessage(), request.getDescription(false));

        ErrorResponse errorResponse = new ErrorResponse(
            400,
            "잘못된 요청입니다",
            ex.getMessage()
        );
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle SessionNotFoundException - 404 Not Found
     */
    @ExceptionHandler(SessionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleSessionNotFound(SessionNotFoundException ex, WebRequest request) {
        logger.warn("Session not found: {} for {}", ex.getMessage(), request.getDescription(false));

        ErrorResponse errorResponse = new ErrorResponse(
            404,
            "세션을 찾을 수 없습니다",
            ex.getMessage()
        );
        return ResponseEntity.status(404).body(errorResponse);
    }

    /**
     * Handle TaroServiceException - 500 Internal Server Error
     */
    @ExceptionHandler(TaroServiceException.class)
    public ResponseEntity<ErrorResponse> handleTaroServiceException(TaroServiceException ex, WebRequest request) {
        logger.error("Taro service error: {} for {}", ex.getMessage(), request.getDescription(false), ex);

        String operationName = determineOperationName(ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
            500,
            operationName + " 실패",
            ex.getMessage()
        );
        return ResponseEntity.internalServerError().body(errorResponse);
    }

    /**
     * Handle validation errors - 400 Bad Request
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        logger.warn("Validation error for {}: {}", request.getDescription(false), ex.getBindingResult().getAllErrors());

        String message = ex.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("입력값이 유효하지 않습니다");

        ErrorResponse errorResponse = new ErrorResponse(
            400,
            "입력값 검증 실패",
            message
        );
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle generic exceptions - 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unexpected error for {}: {}", request.getDescription(false), ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
            500,
            "서버 내부 오류가 발생했습니다",
            "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
        return ResponseEntity.internalServerError().body(errorResponse);
    }

    /**
     * Helper method to determine operation name from error message
     */
    private String determineOperationName(String message) {
        if (message == null) return "작업";

        if (message.contains("session") || message.contains("세션")) {
            return "세션 처리";
        } else if (message.contains("card") || message.contains("카드")) {
            return "타로 카드 생성";
        } else if (message.contains("result") || message.contains("결과") || message.contains("해석")) {
            return "타로 결과 생성";
        } else if (message.contains("topic") || message.contains("주제")) {
            return "주제 목록 조회";
        } else if (message.contains("reader") || message.contains("리더")) {
            return "리더 목록 조회";
        } else if (message.contains("SSE") || message.contains("이벤트")) {
            return "실시간 연결";
        }

        return "작업";
    }

    /**
     * Create too early (425) response for processing status
     */
    public static ResponseEntity<ErrorResponse> createTooEarlyResponse() {
        ErrorResponse errorResponse = new ErrorResponse(
            425,
            "아직 처리 중입니다",
            "타로 해석이 진행 중입니다. 잠시 후 다시 시도해주세요."
        );
        return ResponseEntity.status(425).body(errorResponse);
    }
}