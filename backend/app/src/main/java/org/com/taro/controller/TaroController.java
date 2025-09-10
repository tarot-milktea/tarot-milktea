package org.com.taro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.com.taro.dto.*;
import org.com.taro.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
@Tag(name = "Taro API", description = "타로 서비스 API")
public class TaroController {

    @Autowired
    private MockDataService mockDataService;

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
            String sessionId = mockDataService.createSession(nickname);
            return ResponseEntity.ok(new SessionResponse(sessionId));
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
            TopicResponse response = new TopicResponse(mockDataService.getCategories());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "주제 목록 조회 실패", e.getMessage()));
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
            ReaderResponse response = new ReaderResponse(mockDataService.getReaders());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "리더 목록 조회 실패", e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionId}/submit")
    @Operation(summary = "최종 선택 결과 전송", description = "선택한 카테고리, 주제, 질문, 리더 정보를 전송하고 타로 결과를 받습니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "타로 결과 생성 성공",
                    content = @Content(schema = @Schema(implementation = TaroResultResponse.class))),
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
            @RequestBody SubmitRequest request) {
        try {
            // TODO: 추후 제거 예정 - 현재는 모든 sessionId 허용
            // 세션 존재 여부 확인
            // if (!mockDataService.sessionExists(sessionId)) {
            //     return ResponseEntity.status(404)
            //             .body(new ErrorResponse(404, "세션을 찾을 수 없습니다", "sessionId: " + sessionId));
            // }

            // 필수 필드 검증
            if (request.getCategoryCode() == null || request.getCategoryCode().trim().isEmpty() || 
                request.getTopicCode() == null || request.getTopicCode().trim().isEmpty() || 
                request.getQuestionText() == null || request.getQuestionText().trim().isEmpty() ||
                request.getReaderType() == null || request.getReaderType().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "필수 필드가 누락되었습니다", 
                                "categoryCode, topicCode, questionText, readerType, selectedCards는 모두 필수입니다"));
            }

            // 카테고리 코드 검증
            if (!mockDataService.isValidCategoryCode(request.getCategoryCode())) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "유효하지 않은 카테고리입니다", 
                                "사용 가능한 카테고리 코드: LOVE(연애), JOB(취업), MONEY(금전)"));
            }

            // 토픽 코드 검증
            if (!mockDataService.isValidTopicCode(request.getCategoryCode(), request.getTopicCode())) {
                String availableTopics = getAvailableTopics(request.getCategoryCode());
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "해당 카테고리에서 지원하지 않는 주제입니다", 
                                availableTopics));
            }

            // 질문 텍스트 길이 검증
            if (request.getQuestionText().length() > 200) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "질문 텍스트가 너무 깁니다", 
                                "질문은 200자 이하로 입력해주세요 (현재: " + request.getQuestionText().length() + "자)"));
            }

            // 카드 선택 검증
            if (request.getSelectedCards() == null || request.getSelectedCards().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "카드를 선택해주세요", 
                                "최소 1장 이상의 카드를 selectedCards 배열에 포함해야 합니다"));
            }

            if (!mockDataService.isValidCardSelection(request.getSelectedCards())) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "유효하지 않은 카드 정보입니다", 
                                "카드 수트(MAJOR/WANDS/CUPS/SWORDS/PENTACLES)와 번호를 확인해주세요. 카드 위치도 중복되지 않아야 합니다"));
            }

            // 카드 방향 검증
            for (SubmitRequest.CardSelection card : request.getSelectedCards()) {
                if (card.getOrientation() != null && 
                    !"upright".equals(card.getOrientation()) && !"reversed".equals(card.getOrientation())) {
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse(400, "잘못된 카드 방향입니다", 
                                    "orientation은 upright(정방향), reversed(역방향) 중 하나이거나 비워두세요"));
                }
            }

            // 리더 타입 검증
            if (!isValidReaderType(request.getReaderType())) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(400, "지원하지 않는 리더 타입입니다", 
                                "사용 가능한 리더 타입: F(감성형), T(이성형), FT(균형형)"));
            }

            // 타로 결과 생성
            TaroResultResponse result = mockDataService.generateTaroResult(
                    sessionId, request.getCategoryCode(), request.getTopicCode(), 
                    request.getQuestionText(), request.getReaderType(), request.getSelectedCards());

            if (result == null) {
                return ResponseEntity.internalServerError()
                        .body(new ErrorResponse(500, "타로 결과 생성 실패", "결과를 생성할 수 없습니다"));
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse(500, "타로 결과 생성 실패", e.getMessage()));
        }
    }

    private boolean isValidReaderType(String readerType) {
        return "F".equals(readerType) || "T".equals(readerType) || "FT".equals(readerType);
    }

    private String getAvailableTopics(String categoryCode) {
        switch (categoryCode) {
            case "LOVE":
                return "LOVE 카테고리 사용 가능한 주제: REUNION(재회), NEW_LOVE(새로운 인연), CURRENT_RELATIONSHIP(현재 연애), MARRIAGE(결혼), BREAKUP(이별)";
            case "JOB":
                return "JOB 카테고리 사용 가능한 주제: JOB_CHANGE(이직), PROMOTION(승진), NEW_JOB(취업), CAREER_PATH(커리어), WORKPLACE(직장생활)";
            case "MONEY":
                return "MONEY 카테고리 사용 가능한 주제: INVESTMENT(투자), SAVINGS(저축), DEBT(부채), INCOME(수입), BUSINESS(사업)";
            default:
                return "유효하지 않은 카테고리입니다";
        }
    }
}