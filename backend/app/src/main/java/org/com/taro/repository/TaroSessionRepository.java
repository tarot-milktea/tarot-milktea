package org.com.taro.repository;

import org.com.taro.entity.TaroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaroSessionRepository extends JpaRepository<TaroSession, String> {

    // This method is redundant since sessionId is now the primary key
    // Optional<TaroSession> findBySessionId(String sessionId);

    // 특정 상태의 세션들 찾기
    List<TaroSession> findByStatus(TaroSession.SessionStatus status);

    // 특정 기간 동안 생성된 세션들 찾기
    List<TaroSession> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // 특정 닉네임의 세션들 찾기
    List<TaroSession> findByNickname(String nickname);

    // 활성 세션 개수 조회
    @Query("SELECT COUNT(s) FROM TaroSession s WHERE s.status = :status")
    long countByStatus(@Param("status") TaroSession.SessionStatus status);

    // 최근 생성된 세션들 조회 (제한된 개수)
    @Query("SELECT s FROM TaroSession s ORDER BY s.createdAt DESC")
    List<TaroSession> findRecentSessions();

    // sessionId 존재 여부 확인 - use existsById since sessionId is now primary key
    // boolean existsBySessionId(String sessionId);

    // 만료된 세션 삭제를 위한 조회
    @Query("SELECT s FROM TaroSession s WHERE s.updatedAt < :expireTime AND s.status = :status")
    List<TaroSession> findExpiredSessions(@Param("expireTime") LocalDateTime expireTime,
                                        @Param("status") TaroSession.SessionStatus status);
}