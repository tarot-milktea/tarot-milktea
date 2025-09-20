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
import org.com.taro.service.ai.OpenAIClient;
import org.com.taro.service.ai.TaroAiService;
import org.com.taro.service.SSEManager;
import org.com.taro.exception.*;
import org.com.taro.constants.ValidationConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;
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
    private OpenAIClient openAIClient;

    @Autowired
    private TaroAiService taroAiService;

    @Autowired
    private SSEManager sseManager;

    @PostMapping("/sessions")
    @Operation(summary = "세션 생성", description = "새로운 타로 세션을 생성합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "세션 생성 성공",
                    content = @Content(schema = @Schema(implementation = SessionResponse.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> createSession(@RequestBody(required = false) CreateSessionRequest request) {
        try {
            String nickname = (request != null) ? request.getNickname() : null;
            String sessionId = taroService.createSession(nickname);
            return ResponseEntity.ok(new SessionResponse(sessionId));
        } catch (TaroServiceException e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "세션 생성에 실패했습니다", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "세션 생성에 실패했습니다", "서버 내부 오류로 세션을 생성할 수 없습니다"));
        }
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
        try {
            TopicResponse response = new TopicResponse(taroService.getCategories());
            return ResponseEntity.ok(response);
        } catch (TaroServiceException e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "주제 목록 조회 실패", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "주제 목록 조회 실패", "서버 내부 오류가 발생했습니다"));
        }
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
        try {
            ReaderResponse response = new ReaderResponse(taroService.getReaders());
            return ResponseEntity.ok(response);
        } catch (TaroServiceException e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "리더 목록 조회 실패", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "리더 목록 조회 실패", "서버 내부 오류가 발생했습니다"));
        }
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
        try {
            // 세션 ID 검증
            if (!StringUtils.hasText(sessionId)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "유효하지 않은 세션 ID입니다", "세션 ID는 필수입니다"));
            }

            // 필수 필드 검증
            validateRequiredFields(request);


            // 비즈니스 로직 검증
            validateBusinessRules(request);

            // 기본 TaroReading 정보 업데이트 (동기)
            taroService.generateTaroResult(
                    sessionId, request.getCategoryCode(), request.getTopicCode(),
                    request.getQuestionText(), request.getReaderType());

            // 비동기 AI 처리 시작
            taroAiService.processSequentially(sessionId, request);

            return ResponseEntity.ok(new SubmitResultResponse(true, "타로 해석이 시작되었습니다. SSE를 통해 진행상황을 확인하세요.", sessionId));

        } catch (InvalidRequestException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(400, "잘못된 요청입니다", e.getMessage()));
        } catch (SessionNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(new ErrorResponse(404, "세션을 찾을 수 없습니다", e.getMessage()));
        } catch (TaroServiceException e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "타로 결과 생성 실패", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "타로 결과 생성 실패", "서버 내부 오류가 발생했습니다"));
        }
    }

    private void validateRequiredFields(SubmitRequest request) {
        if (request.getCategoryCode() == null || request.getCategoryCode().trim().isEmpty() ||
                request.getTopicCode() == null || request.getTopicCode().trim().isEmpty() ||
                request.getQuestionText() == null || request.getQuestionText().trim().isEmpty() ||
                request.getReaderType() == null || request.getReaderType().trim().isEmpty()) {
            throw new InvalidRequestException("필수 필드가 누락되었습니다: categoryCode, topicCode, questionText, readerType는 모두 필수입니다");
        }
    }

    private void validateBusinessRules(SubmitRequest request) {
        // 카테고리 코드 검증
        if (!taroService.isValidCategoryCode(request.getCategoryCode())) {
            throw new InvalidRequestException("유효하지 않은 카테고리입니다: 사용 가능한 카테고리 코드: LOVE(연애), JOB(취업), MONEY(금전)");
        }

        // 토픽 코드 검증
        if (!taroService.isValidTopicCode(request.getCategoryCode(), request.getTopicCode())) {
            String availableTopics = getAvailableTopics(request.getCategoryCode());
            throw new InvalidRequestException("해당 카테고리에서 지원하지 않는 주제입니다: " + availableTopics);
        }

        // 질문 텍스트 길이 검증
        if (request.getQuestionText().length() > ValidationConstants.MAX_QUESTION_LENGTH) {
            throw new InvalidRequestException("질문 텍스트가 너무 깁니다: 질문은 " + ValidationConstants.MAX_QUESTION_LENGTH + "자 이하로 입력해주세요 (현재: " + request.getQuestionText().length() + "자)");
        }


        // 리더 타입 검증
        if (!isValidReaderType(request.getReaderType())) {
            throw new InvalidRequestException("지원하지 않는 리더 타입입니다: 사용 가능한 리더 타입: F(감성형), T(이성형), FT(균형형)");
        }
    }

    private boolean isValidReaderType(String readerType) {
        return ValidationConstants.READER_TYPE_F.equals(readerType) ||
                ValidationConstants.READER_TYPE_T.equals(readerType) ||
                ValidationConstants.READER_TYPE_FT.equals(readerType);
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
        try {
            // 세션 ID 검증
            if (!StringUtils.hasText(sessionId)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "유효하지 않은 세션 ID입니다", "세션 ID는 필수입니다"));
            }

            TaroReadingResponse result = taroService.generateTaroReading(sessionId);
            return ResponseEntity.ok(result);

        } catch (SessionNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(new ErrorResponse(404, "세션을 찾을 수 없습니다", e.getMessage()));
        } catch (TaroServiceException e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "타로 카드 생성 실패", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "타로 카드 생성 실패", "서버 내부 오류가 발생했습니다"));
        }
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
        try {
            // 세션 ID 검증
            if (!StringUtils.hasText(sessionId)) {
                throw new InvalidRequestException("유효하지 않은 세션 ID입니다");
            }

            // 세션 존재 여부 확인
            if (!taroService.sessionExists(sessionId)) {
                throw new SessionNotFoundException(sessionId);
            }

            // SSE 연결 생성
            return sseManager.addEmitter(sessionId);

        } catch (SessionNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new TaroServiceException("SSE 연결에 실패했습니다: " + e.getMessage());
        }
    }

    private String getAvailableTopics(String categoryCode) {
        switch (categoryCode) {
            case ValidationConstants.CATEGORY_LOVE:
                return "LOVE 카테고리 사용 가능한 주제: REUNION(재회), NEW_LOVE(새로운 인연), CURRENT_RELATIONSHIP(현재 연애), MARRIAGE(결혼), BREAKUP(이별)";
            case ValidationConstants.CATEGORY_JOB:
                return "JOB 카테고리 사용 가능한 주제: JOB_CHANGE(이직), PROMOTION(승진), NEW_JOB(취업), CAREER_PATH(커리어), WORKPLACE(직장생활)";
            case ValidationConstants.CATEGORY_MONEY:
                return "MONEY 카테고리 사용 가능한 주제: INVESTMENT(투자), SAVINGS(저축), DEBT(부채), INCOME(수입), BUSINESS(사업)";
            default:
                return "유효하지 않은 카테고리입니다";
        }
    }
}