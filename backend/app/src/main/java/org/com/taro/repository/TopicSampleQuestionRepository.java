package org.com.taro.repository;

import org.com.taro.entity.TopicSampleQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicSampleQuestionRepository extends JpaRepository<TopicSampleQuestion, Integer> {

    List<TopicSampleQuestion> findByTopicCode(String topicCode);

    List<TopicSampleQuestion> findByQuestionContaining(String keyword);

    @Query(value = "SELECT * FROM topic_sample_questions WHERE topic_code = :topicCode ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<TopicSampleQuestion> findRandomQuestionsByTopicCode(@Param("topicCode") String topicCode, @Param("limit") int limit);

    @Query("SELECT COUNT(tsq) FROM TopicSampleQuestion tsq WHERE tsq.topicCode = :topicCode")
    long countByTopicCode(@Param("topicCode") String topicCode);
}