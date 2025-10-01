package org.com.taro.service;

import org.com.taro.dto.TopicResponse;
import org.com.taro.dto.ReaderResponse;
import org.com.taro.dto.TaroReadingResponse;
import org.com.taro.dto.TaroResultResponse;

import java.util.List;

public interface TaroService {

    /**
     * 새로운 타로 세션을 생성합니다.
     */
    String createSession(String nickname);

    /**
     * 세션 존재 여부를 확인합니다.
     */
    boolean sessionExists(String sessionId);

    /**
     * 카테고리 목록을 조회합니다.
     */
    List<TopicResponse.Category> getCategories();

    /**
     * 리더 목록을 조회합니다.
     */
    List<ReaderResponse.Reader> getReaders();

    /**
     * 타로 결과를 생성하고 저장합니다.
     */
    void generateTaroResult(String sessionId, String categoryCode, String topicCode,
                           String questionText, String readerType);

    /**
     * 카테고리 코드가 유효한지 검증합니다.
     */
    boolean isValidCategoryCode(String categoryCode);

    /**
     * 토픽 코드가 유효한지 검증합니다.
     */
    boolean isValidTopicCode(String categoryCode, String topicCode);

    /**
     * 세션에 대한 3장의 타로 카드를 생성합니다.
     */
    TaroReadingResponse generateTaroReading(String sessionId);

    /**
     * 세션의 타로 해석 결과를 조회합니다.
     */
    TaroResultResponse getSessionResult(String sessionId);
}