package org.com.taro.validator;

import org.com.taro.dto.SubmitRequest;
import org.com.taro.service.TaroService;
import org.com.taro.service.ReferenceDataService;
import org.com.taro.constants.ValidationConstants;
import org.com.taro.exception.InvalidRequestException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class TaroRequestValidator {

    private final ReferenceDataService referenceDataService;

    public TaroRequestValidator(TaroService taroService, ReferenceDataService referenceDataService) {
        this.referenceDataService = referenceDataService;
    }

    /**
     * Validate session ID format and presence
     */
    public void validateSessionId(String sessionId) {
        if (!StringUtils.hasText(sessionId)) {
            throw new InvalidRequestException("유효하지 않은 세션 ID입니다: 세션 ID는 필수입니다");
        }
    }

    /**
     * Validate submit request - all required fields and business rules
     */
    public void validateSubmitRequest(SubmitRequest request) {
        validateRequiredFields(request);
        validateBusinessRules(request);
    }

    /**
     * Validate required fields are present and not empty
     */
    private void validateRequiredFields(SubmitRequest request) {
        if (request.getCategoryCode() == null || request.getCategoryCode().trim().isEmpty() ||
                request.getTopicCode() == null || request.getTopicCode().trim().isEmpty() ||
                request.getQuestionText() == null || request.getQuestionText().trim().isEmpty() ||
                request.getReaderType() == null || request.getReaderType().trim().isEmpty()) {
            throw new InvalidRequestException("필수 필드가 누락되었습니다: categoryCode, topicCode, questionText, readerType는 모두 필수입니다");
        }
    }

    /**
     * Validate business rules for submit request
     */
    private void validateBusinessRules(SubmitRequest request) {
        // 카테고리 코드 검증
        if (!referenceDataService.isValidCategoryCode(request.getCategoryCode())) {
            String validCategories = referenceDataService.getValidCategoriesMessage();
            throw new InvalidRequestException("유효하지 않은 카테고리입니다: " + validCategories);
        }

        // 토픽 코드 검증
        if (!referenceDataService.isValidTopicCode(request.getTopicCode())) {
            String availableTopics = referenceDataService.getAvailableTopicsMessage(request.getCategoryCode());
            throw new InvalidRequestException("유효하지 않은 주제입니다: " + availableTopics);
        }

        // 토픽과 카테고리 간의 관계 검증
        if (!referenceDataService.isValidTopicForCategory(request.getTopicCode(), request.getCategoryCode())) {
            String availableTopics = referenceDataService.getAvailableTopicsMessage(request.getCategoryCode());
            throw new InvalidRequestException("해당 카테고리에서 지원하지 않는 주제입니다: " + availableTopics);
        }

        // 질문 텍스트 길이 검증
        if (request.getQuestionText().length() > ValidationConstants.MAX_QUESTION_LENGTH) {
            throw new InvalidRequestException("질문 텍스트가 너무 깁니다: 질문은 " + ValidationConstants.MAX_QUESTION_LENGTH + "자 이하로 입력해주세요 (현재: " + request.getQuestionText().length() + "자)");
        }

        // 리더 타입 검증
        if (!referenceDataService.isValidReaderType(request.getReaderType())) {
            String availableReaderTypes = referenceDataService.getAvailableReaderTypesMessage();
            throw new InvalidRequestException("지원하지 않는 리더 타입입니다: " + availableReaderTypes);
        }
    }

}