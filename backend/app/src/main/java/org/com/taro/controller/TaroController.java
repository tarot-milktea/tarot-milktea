package org.com.taro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.com.taro.dto.*;
import org.com.taro.service.TaroService;
import org.com.taro.service.ai.TaroAiService;
import org.com.taro.service.SSEManager;
import org.com.taro.exception.*;
import org.com.taro.enums.ProcessingStatus;
import org.com.taro.validator.TaroRequestValidator;
import org.com.taro.exception.GlobalExceptionHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/")
@Tag(name = "Taro API", description = "타로 서비스 API")
public class TaroController {

    private final TaroService taroService;

    public TaroController(TaroService taroService) {
        this.taroService = taroService;
    }


    @Autowired
    private TaroAiService taroAiService;

    @Autowired
    private SSEManager sseManager;

    @Autowired
    private TaroRequestValidator requestValidator;


    @PostMapping("/sessions")
    @Operation(summary = "세션 생성", description = "새로운 타로 세션을 생성합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "세션 생성 성공",
                    content = @Content(schema = @Schema(implementation = SessionResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> createSession(@RequestBody(required = false) CreateSessionRequest request) {
        String nickname = (request != null) ? request.getNickname() : null;
        String sessionId = taroService.createSession(nickname);
        return ResponseEntity.ok(new SessionResponse(sessionId));
    }

    @GetMapping("/topics")
    @Operation(summary = "주제 목록 조회", description = "카테고리, 주제, 질문의 계층 구조를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "주제 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = TopicResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getTopics() {
        TopicResponse response = new TopicResponse(taroService.getCategories());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/readers")
    @Operation(summary = "리더 목록 조회", description = "타로 리더(페르소나) 목록을 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "리더 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = ReaderResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getReaders() {
        ReaderResponse response = new ReaderResponse(taroService.getReaders());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{sessionId}/submit")
    @Operation(summary = "최종 선택 결과 전송", description = "선택한 카테고리, 주제, 질문, 리더 정보를 전송하고 타로 결과 생성을 확인합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "타로 결과 생성 성공",
                    content = @Content(schema = @Schema(implementation = SubmitResultResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "세션을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> submitChoices(
            @Parameter(description = "세션 ID", required = true)
            @PathVariable String sessionId,
            @Valid @RequestBody SubmitRequest request) {
        // 세션 ID 검증
        requestValidator.validateSessionId(sessionId);

        // 요청 검증 (필수 필드 + 비즈니스 로직)
        requestValidator.validateSubmitRequest(request);

        // 기본 TaroReading 정보 업데이트 (동기)
        taroService.generateTaroResult(
                sessionId, request.getCategoryCode(), request.getTopicCode(),
                request.getQuestionText(), request.getReaderType());

        // 비동기 AI 처리 시작
        taroAiService.processSequentially(sessionId, request);

        return ResponseEntity.ok(new SubmitResultResponse(true, "타로 해석이 시작되었습니다. SSE를 통해 진행상황을 확인하세요.", sessionId));
    }


    @GetMapping("/sessions/{sessionId}/cards")
    @Operation(summary = "세션별 타로 카드 3장 생성", description = "세션 생성 시 자동으로 과거/현재/미래 카드 3장을 랜덤으로 생성합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "타로 카드 3장 생성 성공",
                    content = @Content(schema = @Schema(implementation = TaroReadingResponse.class))),
            @ApiResponse(responseCode = "404", description = "세션을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getSessionCards(
            @Parameter(description = "세션 ID", required = true)
            @PathVariable String sessionId) {
        // 세션 ID 검증
        requestValidator.validateSessionId(sessionId);

        TaroReadingResponse result = taroService.generateTaroReading(sessionId);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/sessions/{sessionId}/events", produces = "text/event-stream")
    @Operation(summary = "세션 이벤트 구독", description = "SSE를 통해 타로 해석 진행상황을 실시간으로 구독합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "SSE 연결 성공"),
            @ApiResponse(responseCode = "404", description = "세션을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public SseEmitter subscribeToSession(
            @Parameter(description = "세션 ID", required = true)
            @PathVariable String sessionId) {
        // 세션 ID 검증
        requestValidator.validateSessionId(sessionId);

        // 세션 존재 여부 확인
        if (!taroService.sessionExists(sessionId)) {
            throw new SessionNotFoundException(sessionId);
        }

        // SSE 연결 생성
        return sseManager.addEmitter(sessionId);
    }

    @GetMapping("/sessions/{sessionId}/result")
    @Operation(summary = "타로 해석 결과 조회", description = "완료된 타로 해석 결과를 조회합니다 (카드 정보 제외)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "결과 조회 성공",
                    content = @Content(schema = @Schema(implementation = TaroResultResponse.class))),
            @ApiResponse(responseCode = "404", description = "세션을 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "425", description = "아직 처리 중입니다",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getSessionResult(
            @Parameter(description = "세션 ID", required = true)
            @PathVariable String sessionId) {
        // 세션 ID 검증
        requestValidator.validateSessionId(sessionId);

        TaroResultResponse result = taroService.getSessionResult(sessionId);

        // 처리 상태에 따른 응답
        if (ProcessingStatus.isEarlyProcessingStatus(result.getStatus())) {
            // 아직 시작되지 않은 경우만 425 에러
            return GlobalExceptionHandler.createTooEarlyResponse();
        }

        // 처리 중이거나 완료된 경우 모두 중간 결과 포함하여 200 반환
        return ResponseEntity.ok(result);
    }

}