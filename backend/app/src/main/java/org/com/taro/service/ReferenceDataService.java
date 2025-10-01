package org.com.taro.service;

import org.com.taro.entity.Category;
import org.com.taro.entity.LuckyCard;
import org.com.taro.entity.Reader;
import org.com.taro.entity.Topic;
import org.com.taro.repository.CategoryRepository;
import org.com.taro.repository.LuckyCardRepository;
import org.com.taro.repository.ReaderRepository;
import org.com.taro.repository.TopicRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Service for managing reference data from database instead of enums
 * 데이터베이스 기반 참조 데이터 관리 서비스 (enum 대신)
 */
@Service
public class ReferenceDataService {

    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;
    private final ReaderRepository readerRepository;
    private final LuckyCardRepository luckyCardRepository;
    private final Random random;

    public ReferenceDataService(CategoryRepository categoryRepository,
                              TopicRepository topicRepository,
                              ReaderRepository readerRepository,
                              LuckyCardRepository luckyCardRepository) {
        this.categoryRepository = categoryRepository;
        this.topicRepository = topicRepository;
        this.readerRepository = readerRepository;
        this.luckyCardRepository = luckyCardRepository;
        this.random = new Random();
    }

    // Category operations - 카테고리 관련 메서드

    @Cacheable("categories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Cacheable("category")
    public Optional<Category> findCategoryByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return Optional.empty();
        }
        return categoryRepository.findByCode(code.trim().toUpperCase());
    }

    public boolean isValidCategoryCode(String code) {
        return findCategoryByCode(code).isPresent();
    }

    public String getCategoryName(String code) {
        return findCategoryByCode(code)
                .map(Category::getName)
                .orElse(code);
    }

    // Topic operations - 주제 관련 메서드

    @Cacheable("topics")
    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    @Cacheable("topic")
    public Optional<Topic> findTopicByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return Optional.empty();
        }
        return topicRepository.findByCode(code.trim().toUpperCase());
    }

    @Cacheable("topicsByCategory")
    public List<Topic> getTopicsByCategoryCode(String categoryCode) {
        if (categoryCode == null || categoryCode.trim().isEmpty()) {
            return List.of();
        }
        return topicRepository.findByCategoryCode(categoryCode.trim().toUpperCase());
    }

    public boolean isValidTopicCode(String code) {
        return findTopicByCode(code).isPresent();
    }

    public boolean isValidTopicForCategory(String topicCode, String categoryCode) {
        return findTopicByCode(topicCode)
                .map(topic -> topic.getCategoryCode().equals(categoryCode))
                .orElse(false);
    }

    public String getTopicName(String code) {
        return findTopicByCode(code)
                .map(Topic::getName)
                .orElse(code);
    }

    public String getAvailableTopicsMessage(String categoryCode) {
        Optional<Category> category = findCategoryByCode(categoryCode);
        if (category.isEmpty()) {
            return "유효하지 않은 카테고리입니다";
        }

        List<Topic> topics = getTopicsByCategoryCode(categoryCode);
        if (topics.isEmpty()) {
            return category.get().getName() + " 카테고리에 사용 가능한 주제가 없습니다";
        }

        StringBuilder message = new StringBuilder();
        message.append(category.get().getName()).append(" 카테고리 사용 가능한 주제: ");

        for (int i = 0; i < topics.size(); i++) {
            Topic topic = topics.get(i);
            message.append(topic.getCode()).append("(").append(topic.getName()).append(")");
            if (i < topics.size() - 1) {
                message.append(", ");
            }
        }

        return message.toString();
    }

    // Reader operations - 리더 관련 메서드

    @Cacheable("readers")
    public List<Reader> getAllReaders() {
        return readerRepository.findAll();
    }

    @Cacheable("reader")
    public Optional<Reader> findReaderByType(String type) {
        if (type == null || type.trim().isEmpty()) {
            return Optional.empty();
        }
        return readerRepository.findByType(type.trim().toUpperCase());
    }

    public boolean isValidReaderType(String type) {
        return findReaderByType(type).isPresent();
    }

    public String getReaderName(String type) {
        return findReaderByType(type)
                .map(Reader::getName)
                .orElse(type);
    }

    public String getReaderDescription(String type) {
        return findReaderByType(type)
                .map(Reader::getDescription)
                .orElse("");
    }

    public String getReaderVideoUrl(String type) {
        return findReaderByType(type)
                .map(Reader::getVideoUrl)
                .orElse("");
    }

    public String getAvailableReaderTypesMessage() {
        List<Reader> readers = getAllReaders();
        if (readers.isEmpty()) {
            return "사용 가능한 리더 타입이 없습니다";
        }

        StringBuilder message = new StringBuilder("사용 가능한 리더 타입: ");
        for (int i = 0; i < readers.size(); i++) {
            Reader reader = readers.get(i);
            message.append(reader.getType()).append("(").append(reader.getName()).append(")");
            if (i < readers.size() - 1) {
                message.append(", ");
            }
        }

        return message.toString();
    }

    // Validation helper methods - 검증 헬퍼 메서드

    public String getValidCategoriesMessage() {
        List<Category> categories = getAllCategories();
        if (categories.isEmpty()) {
            return "사용 가능한 카테고리가 없습니다";
        }

        StringBuilder message = new StringBuilder("사용 가능한 카테고리 코드: ");
        for (int i = 0; i < categories.size(); i++) {
            Category category = categories.get(i);
            message.append(category.getCode()).append("(").append(category.getName()).append(")");
            if (i < categories.size() - 1) {
                message.append(", ");
            }
        }

        return message.toString();
    }

    // Lucky Card operations - 행운 카드 관련 메서드

    /**
     * 랜덤 행운 카드 ID 생성 (1-30)
     */
    public Integer selectRandomLuckyCardId() {
        return random.nextInt(30) + 1;
    }

    @Cacheable("luckyCard")
    public Optional<LuckyCard> findLuckyCardById(Integer id) {
        if (id == null || id < 1 || id > 30) {
            return Optional.empty();
        }
        return luckyCardRepository.findById(id);
    }
}