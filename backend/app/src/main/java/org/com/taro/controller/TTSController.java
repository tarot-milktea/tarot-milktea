package org.com.taro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.com.taro.config.OpenAIConfig;
import org.com.taro.dto.TTSRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/tts")
@CrossOrigin(origins = "*")
@Tag(name = "TTS", description = "Text-to-Speech API")
public class TTSController {

    private static final Logger logger = LoggerFactory.getLogger(TTSController.class);

    private final WebClient webClient;
    private final OpenAIConfig openAIConfig;

    public TTSController(WebClient.Builder webClientBuilder, OpenAIConfig openAIConfig) {
        this.openAIConfig = openAIConfig;
        this.webClient = webClientBuilder
            .baseUrl(openAIConfig.getBaseUrl())
            .build();
    }

    @PostMapping(value = "/speech", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "텍스트를 음성으로 변환", description = "주어진 텍스트를 SSE 스트림으로 음성 데이터 반환")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "음성 변환 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public SseEmitter generateTTSSpeech(@Valid @RequestBody TTSRequest request, HttpServletResponse response) {
        logger.info("TTS 음성 변환 요청: text length={}, voice={}, model={}, speed={}",
                request.getText().length(), request.getVoice(), request.getModel(), request.getSpeed());

        // CORS 헤더 명시적 설정
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");
        response.setContentType("text/event-stream");

        SseEmitter emitter = new SseEmitter(60000L); // 60초 타임아웃

        // GMS API 요청 본문 생성
        Map<String, Object> gmsRequest = Map.of(
            "model", request.getModel(),
            "input", request.getText(),
            "voice", request.getVoice(),
            "speed", request.getSpeed(),
            "stream_format", "sse"
        );

        CompletableFuture.runAsync(() -> {
            try {
                logger.debug("GMS API 호출 시작: /audio/speech");

                webClient.post()
                    .uri("/audio/speech")
                    .header("Authorization", "Bearer " + openAIConfig.getApiKey())
                    .header("Content-Type", "application/json")
                    .bodyValue(gmsRequest)
                    .retrieve()
                    .bodyToFlux(String.class)
                    .doOnNext(chunk -> {
                        try {
                            // SSE 형식으로 클라이언트에 전송
                            if (chunk.startsWith("data: ")) {
                                String data = chunk.substring(6).trim();
                                if (!data.equals("[DONE]")) {
                                    emitter.send(SseEmitter.event().data(data));
                                }
                            }
                        } catch (IOException e) {
                            logger.error("SSE 데이터 전송 중 오류 발생", e);
                            emitter.completeWithError(e);
                        }
                    })
                    .doOnComplete(() -> {
                        logger.info("TTS 스트림 완료");
                        emitter.complete();
                    })
                    .doOnError(error -> {
                        logger.error("GMS API 호출 중 오류 발생", error);
                        try {
                            String errorMessage = String.format(
                                "{\"type\":\"error\",\"error\":\"%s\"}",
                                error.getMessage().replace("\"", "\\\"")
                            );
                            emitter.send(SseEmitter.event().data(errorMessage));
                        } catch (IOException e) {
                            logger.error("에러 메시지 전송 중 오류 발생", e);
                        }
                        emitter.completeWithError(error);
                    })
                    .subscribe();

            } catch (Exception e) {
                logger.error("TTS 처리 중 예외 발생", e);
                try {
                    String errorMessage = String.format(
                        "{\"type\":\"error\",\"error\":\"%s\"}",
                        e.getMessage().replace("\"", "\\\"")
                    );
                    emitter.send(SseEmitter.event().data(errorMessage));
                } catch (IOException ioException) {
                    logger.error("에러 메시지 전송 중 IO 예외 발생", ioException);
                }
                emitter.completeWithError(e);
            }
        });

        // SSE 연결 해제 시 정리 작업
        emitter.onCompletion(() -> logger.info("TTS SSE 연결 완료"));
        emitter.onTimeout(() -> {
            logger.warn("TTS SSE 연결 타임아웃");
            emitter.complete();
        });
        emitter.onError(throwable -> logger.error("TTS SSE 연결 오류", throwable));

        return emitter;
    }

    @RequestMapping(value = "/speech", method = RequestMethod.OPTIONS)
    public void handlePreflight(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}