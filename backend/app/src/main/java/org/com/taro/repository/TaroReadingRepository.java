package org.com.taro.repository;

import org.com.taro.entity.TaroReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaroReadingRepository extends JpaRepository<TaroReading, Integer> {

    List<TaroReading> findBySessionId(String sessionId);

    List<TaroReading> findByCategoryCode(String categoryCode);

    List<TaroReading> findByTopicCode(String topicCode);

    List<TaroReading> findByReaderType(String readerType);

    List<TaroReading> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT tr FROM TaroReading tr JOIN FETCH tr.drawnCards WHERE tr.sessionId = :sessionId")
    Optional<TaroReading> findBySessionIdWithDrawnCards(@Param("sessionId") String sessionId);

    @Query("SELECT COUNT(tr) FROM TaroReading tr WHERE tr.sessionId = :sessionId")
    long countBySessionId(@Param("sessionId") String sessionId);

    boolean existsBySessionId(String sessionId);
}