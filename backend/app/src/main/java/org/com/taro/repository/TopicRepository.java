package org.com.taro.repository;

import org.com.taro.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, String> {

    Optional<Topic> findByCode(String code);

    List<Topic> findByCategoryCode(String categoryCode);

    List<Topic> findByNameContaining(String name);

    @Query("SELECT t FROM Topic t JOIN FETCH t.sampleQuestions WHERE t.categoryCode = :categoryCode")
    List<Topic> findByCategoryCodeWithSampleQuestions(@Param("categoryCode") String categoryCode);

    @Query("SELECT t FROM Topic t JOIN FETCH t.sampleQuestions WHERE t.code = :code")
    Optional<Topic> findByCodeWithSampleQuestions(@Param("code") String code);

    boolean existsByCode(String code);
}