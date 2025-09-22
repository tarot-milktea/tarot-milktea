package org.com.taro.service;

import org.com.taro.dto.*;
import org.com.taro.entity.*;
import org.com.taro.repository.*;
import org.com.taro.exception.SessionNotFoundException;
import org.com.taro.exception.TaroServiceException;
import org.com.taro.constants.ValidationConstants;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class TaroServiceImpl implements TaroService {

    private final TaroSessionRepository taroSessionRepository;
    private final TaroCardRepository taroCardRepository;
    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;
    private final ReaderRepository readerRepository;
    private final TaroReadingRepository taroReadingRepository;
    private final DrawnCardRepository drawnCardRepository;
    private final TopicSampleQuestionRepository topicSampleQuestionRepository;

    public TaroServiceImpl(TaroSessionRepository taroSessionRepository,
                          TaroCardRepository taroCardRepository,
                          CategoryRepository categoryRepository,
                          TopicRepository topicRepository,
                          ReaderRepository readerRepository,
                          TaroReadingRepository taroReadingRepository,
                          DrawnCardRepository drawnCardRepository,
                          TopicSampleQuestionRepository topicSampleQuestionRepository) {
        this.taroSessionRepository = taroSessionRepository;
        this.taroCardRepository = taroCardRepository;
        this.categoryRepository = categoryRepository;
        this.topicRepository = topicRepository;
        this.readerRepository = readerRepository;
        this.taroReadingRepository = taroReadingRepository;
        this.drawnCardRepository = drawnCardRepository;
        this.topicSampleQuestionRepository = topicSampleQuestionRepository;
    }

    @Override
    public String createSession(String nickname) {
        String sessionId = generateSessionId();

        // 1. 세션 생성
        TaroSession session = new TaroSession();
        session.setSessionId(sessionId);
        session.setNickname(nickname);
        session.setStatus(TaroSession.SessionStatus.ACTIVE);
        session.setProcessingStatus(TaroSession.ProcessingStatus.CREATED);
        taroSessionRepository.save(session);

        // 2. 빈 TaroReading 레코드 생성 (나중에 submit 시 업데이트)
        TaroReading taroReading = new TaroReading();
        taroReading.setSessionId(sessionId);
        taroReading.setCategoryCode(null);  // Submit 시 설정
        taroReading.setTopicCode(null);     // Submit 시 설정
        taroReading.setQuestionText(null);  // Submit 시 설정
        taroReading.setReaderType(null);    // Submit 시 설정
        taroReading = taroReadingRepository.save(taroReading);

        // 3. 랜덤 카드 3장 선택하여 drawn_cards에 저장
        try {
            List<TaroCardEntity> allCards = taroCardRepository.findRandomCards(78);
            if (allCards.size() < 3) {
                throw new TaroServiceException("Not enough cards in database");
            }

            Random random = new Random();
            Set<Integer> usedCardIds = new HashSet<>();

            for (int position = 1; position <= 3; position++) {
                TaroCardEntity selectedCard;
                do {
                    selectedCard = allCards.get(random.nextInt(allCards.size()));
                } while (usedCardIds.contains(selectedCard.getId()));

                usedCardIds.add(selectedCard.getId());

                // 랜덤 방향 결정
                DrawnCard.Orientation orientation = random.nextBoolean() ?
                    DrawnCard.Orientation.upright : DrawnCard.Orientation.reversed;

                // drawn_cards 테이블에 저장
                DrawnCard drawnCard = new DrawnCard();
                drawnCard.setReadingId(taroReading.getId());
                drawnCard.setPosition(position);
                drawnCard.setCardId(selectedCard.getId());
                drawnCard.setOrientation(orientation);
                drawnCardRepository.save(drawnCard);
            }

            // 카드 생성 완료 상태 업데이트
            session.setProcessingStatus(TaroSession.ProcessingStatus.CARDS_GENERATED);
            taroSessionRepository.save(session);

        } catch (Exception e) {
            throw new TaroServiceException("Failed to create cards for session: " + sessionId, e);
        }

        return sessionId;
    }

    private String generateSessionId() {
        Random random = new Random();
        StringBuilder sessionId = new StringBuilder();
        int attempts = 0;
        final int maxAttempts = 1000;

        do {
            sessionId.setLength(0);
            for (int i = 0; i < ValidationConstants.SESSION_ID_LENGTH; i++) {
                sessionId.append(ValidationConstants.SESSION_ID_CHARS.charAt(
                    random.nextInt(ValidationConstants.SESSION_ID_CHARS.length())));
            }
            attempts++;

            if (attempts > maxAttempts) {
                throw new TaroServiceException("Unable to generate unique session ID after " + maxAttempts + " attempts");
            }
        } while (taroSessionRepository.existsById(sessionId.toString()));

        return sessionId.toString();
    }

    @Override
    public boolean sessionExists(String sessionId) {
        return taroSessionRepository.existsById(sessionId);
    }

    @Override
    public List<TopicResponse.Category> getCategories() {
        List<Category> categories = categoryRepository.findAllWithTopics();

        return categories.stream().map(category -> {
            List<TopicResponse.Topic> topics = category.getTopics().stream().map(topic -> {
                List<String> sampleQuestions = topic.getSampleQuestions().stream()
                    .map(TopicSampleQuestion::getQuestion)
                    .collect(java.util.stream.Collectors.toList());

                return new TopicResponse.Topic(
                    topic.getCode(),
                    topic.getName(),
                    topic.getDescription(),
                    sampleQuestions
                );
            }).collect(java.util.stream.Collectors.toList());

            return new TopicResponse.Category(
                category.getCode(),
                category.getName(),
                category.getDescription(),
                topics
            );
        }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<ReaderResponse.Reader> getReaders() {
        List<Reader> readers = readerRepository.findAll();

        return readers.stream().map(reader ->
            new ReaderResponse.Reader(
                reader.getType(),
                reader.getName(),
                reader.getDescription(),
                reader.getImageUrl()
            )
        ).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void generateTaroResult(String sessionId, String categoryCode, String topicCode,
                                   String questionText, String readerType) {
        TaroSession session = taroSessionRepository.findById(sessionId)
            .orElseThrow(() -> new SessionNotFoundException(sessionId));

        try {
            // 기존 TaroReading 레코드 업데이트
            TaroReading taroReading = taroReadingRepository.findBySessionId(sessionId)
                .stream().findFirst()
                .orElseThrow(() -> new TaroServiceException("TaroReading not found for session: " + sessionId));

            taroReading.setCategoryCode(categoryCode);
            taroReading.setTopicCode(topicCode);
            taroReading.setQuestionText(questionText);
            taroReading.setReaderType(readerType);
            taroReadingRepository.save(taroReading);

            // 제출 완료 상태 업데이트 (AI 처리는 비동기로 진행)
            session.setProcessingStatus(TaroSession.ProcessingStatus.SUBMITTED);
            taroSessionRepository.save(session);

            System.out.println("타로 결과가 세션 " + sessionId + "에 대해 생성되었습니다.");
        } catch (Exception e) {
            throw new TaroServiceException("Failed to generate tarot result for session: " + sessionId, e);
        }
    }

    @Override
    public boolean isValidCategoryCode(String categoryCode) {
        return categoryRepository.existsByCode(categoryCode);
    }

    @Override
    public boolean isValidTopicCode(String categoryCode, String topicCode) {
        return topicRepository.findByCode(topicCode)
            .map(topic -> categoryCode.equals(topic.getCategoryCode()))
            .orElse(false);
    }

    @Override
    public TaroReadingResponse generateTaroReading(String sessionId) {
        TaroSession session = taroSessionRepository.findById(sessionId)
            .orElseThrow(() -> new SessionNotFoundException(sessionId));

        try {
            // 세션에 대한 TaroReading 찾기
            TaroReading taroReading = taroReadingRepository.findBySessionId(sessionId)
                .stream().findFirst()
                .orElseThrow(() -> new TaroServiceException("TaroReading not found for session: " + sessionId));

            // 저장된 drawn_cards 조회
            List<DrawnCard> drawnCards = drawnCardRepository.findByReadingIdOrderByPosition(taroReading.getId());
            if (drawnCards.size() != 3) {
                throw new TaroServiceException("Expected 3 cards, but found " + drawnCards.size() + " for session: " + sessionId);
            }

            // DrawnCard를 TaroReadingResponse.DrawnCard로 변환
            List<TaroReadingResponse.DrawnCard> responseCards = new ArrayList<>();
            for (DrawnCard drawnCard : drawnCards) {
                // 카드 정보 조회
                TaroCardEntity cardEntity = taroCardRepository.findById(Long.valueOf(drawnCard.getCardId()))
                    .orElseThrow(() -> new TaroServiceException("Card not found: " + drawnCard.getCardId()));

                String orientation = drawnCard.getOrientation() == DrawnCard.Orientation.upright ?
                    ValidationConstants.ORIENTATION_UPRIGHT : ValidationConstants.ORIENTATION_REVERSED;

                responseCards.add(new TaroReadingResponse.DrawnCard(
                    drawnCard.getPosition(),
                    cardEntity.getId(),
                    cardEntity.getNameKo(),
                    cardEntity.getNameEn(),
                    orientation,
                    cardEntity.getVideoUrl()
                ));
            }

            return new TaroReadingResponse(sessionId, responseCards);
        } catch (Exception e) {
            throw new TaroServiceException("Failed to retrieve tarot reading for session: " + sessionId, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TaroResultResponse getSessionResult(String sessionId) {
        // 세션 존재 확인
        TaroSession session = taroSessionRepository.findById(sessionId)
            .orElseThrow(() -> new SessionNotFoundException(sessionId));

        // TaroReading 조회
        TaroReading taroReading = taroReadingRepository.findBySessionId(sessionId)
            .stream().findFirst()
            .orElseThrow(() -> new TaroServiceException("TaroReading not found for session: " + sessionId));

        // 처리 상태 확인
        String status = session.getProcessingStatus().toString();

        // 해석 결과 구성
        TaroResultResponse.InterpretationsDto interpretations = new TaroResultResponse.InterpretationsDto(
            taroReading.getPastInterpretation(),
            taroReading.getPresentInterpretation(),
            taroReading.getFutureInterpretation(),
            taroReading.getDrawnCards(),
            taroReading.getInterpretation() // summary
        );

        // 결과 이미지 구성
        TaroResultResponse.ResultImageDto resultImage = null;
        if (taroReading.getResultImageUrl() != null) {
            resultImage = new TaroResultResponse.ResultImageDto(
                taroReading.getResultImageUrl(),
                taroReading.getResultImageText()
            );
        }

        return new TaroResultResponse(
            sessionId,
            status,
            interpretations,
            taroReading.getFortuneScore(),
            resultImage
        );
    }

}