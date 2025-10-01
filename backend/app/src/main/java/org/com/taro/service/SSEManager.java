package org.com.taro.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SSEManager {

    private static final Logger logger = LoggerFactory.getLogger(SSEManager.class);
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes

    // 세션별 SSE 연결 관리
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> sessionEmitters = new ConcurrentHashMap<>();

    /**
     * 새로운 SSE 연결 등록
     */
    public SseEmitter addEmitter(String sessionId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        // 세션별 연결 목록에 추가
        sessionEmitters.computeIfAbsent(sessionId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        // 연결 완료/타임아웃 시 정리
        emitter.onCompletion(() -> removeEmitter(sessionId, emitter));
        emitter.onTimeout(() -> removeEmitter(sessionId, emitter));
        emitter.onError((throwable) -> {
            logger.error("SSE error for session: {}", sessionId, throwable);
            removeEmitter(sessionId, emitter);
        });

        // 초기 연결 확인 메시지 전송
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("{\"message\":\"Connected to session\",\"sessionId\":\"" + sessionId + "\"}"));
        } catch (IOException e) {
            logger.error("Failed to send initial SSE message for session: {}", sessionId, e);
            removeEmitter(sessionId, emitter);
        }

        logger.info("SSE connection added for session: {}", sessionId);
        return emitter;
    }

    /**
     * SSE 연결 제거
     */
    private void removeEmitter(String sessionId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = sessionEmitters.get(sessionId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                sessionEmitters.remove(sessionId);
            }
        }
        logger.info("SSE connection removed for session: {}", sessionId);
    }

    /**
     * 특정 세션에 이벤트 전송
     */
    public void sendEvent(String sessionId, String eventType, Object data) {
        CopyOnWriteArrayList<SseEmitter> emitters = sessionEmitters.get(sessionId);
        if (emitters == null || emitters.isEmpty()) {
            logger.debug("No SSE connections for session: {}", sessionId);
            return;
        }

        String jsonData = convertToJson(data);

        // 연결된 모든 클라이언트에게 전송
        emitters.removeIf(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                    .name(eventType)
                    .data(jsonData));
                return false; // 성공적으로 전송됨
            } catch (IOException e) {
                logger.warn("Failed to send SSE event to session: {}, removing connection", sessionId, e);
                return true; // 실패한 연결 제거
            }
        });

        logger.debug("SSE event sent to session: {}, type: {}", sessionId, eventType);
    }

    /**
     * 상태 변경 이벤트 전송
     */
    public void sendStatusEvent(String sessionId, String status, String message, Integer progress) {
        StatusEvent event = new StatusEvent(status, message, progress);
        sendEvent(sessionId, "status_changed", event);
    }

    /**
     * 카드 해석 완료 이벤트 전송
     */
    public void sendCardInterpretedEvent(String sessionId, int position, String interpretation) {
        CardInterpretedEvent event = new CardInterpretedEvent(position, interpretation);
        sendEvent(sessionId, "card_interpreted", event);
    }

    /**
     * 총평 생성 완료 이벤트 전송
     */
    public void sendSummaryEvent(String sessionId, String summary) {
        SummaryEvent event = new SummaryEvent(summary);
        sendEvent(sessionId, "summary_generated", event);
    }

    /**
     * 이미지 생성 완료 이벤트 전송
     */
    public void sendImageEvent(String sessionId, String imageUrl) {
        ImageEvent event = new ImageEvent(imageUrl);
        sendEvent(sessionId, "image_generated", event);
    }

    /**
     * 전체 완료 이벤트 전송
     */
    public void sendCompletedEvent(String sessionId) {
        CompletedEvent event = new CompletedEvent("타로 해석이 완료되었습니다");
        sendEvent(sessionId, "completed", event);
    }

    /**
     * 오류 이벤트 전송
     */
    public void sendErrorEvent(String sessionId, String error) {
        ErrorEvent event = new ErrorEvent(error);
        sendEvent(sessionId, "error", event);
    }

    /**
     * 간단한 JSON 변환
     */
    private String convertToJson(Object data) {
        if (data instanceof String) {
            return (String) data;
        }

        // 간단한 JSON 직렬화 (실제로는 Jackson ObjectMapper 사용 권장)
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            logger.error("Failed to convert object to JSON", e);
            return "{\"error\":\"Failed to serialize data\"}";
        }
    }

    // 이벤트 클래스들
    public static class StatusEvent {
        public String status;
        public String message;
        public Integer progress;

        public StatusEvent(String status, String message, Integer progress) {
            this.status = status;
            this.message = message;
            this.progress = progress;
        }
    }

    public static class CardInterpretedEvent {
        public int position;
        public String interpretation;

        public CardInterpretedEvent(int position, String interpretation) {
            this.position = position;
            this.interpretation = interpretation;
        }
    }

    public static class SummaryEvent {
        public String summary;

        public SummaryEvent(String summary) {
            this.summary = summary;
        }
    }

    public static class ImageEvent {
        public String imageUrl;

        public ImageEvent(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    public static class CompletedEvent {
        public String message;

        public CompletedEvent(String message) {
            this.message = message;
        }
    }

    public static class ErrorEvent {
        public String error;

        public ErrorEvent(String error) {
            this.error = error;
        }
    }
}