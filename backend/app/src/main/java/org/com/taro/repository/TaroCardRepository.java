package org.com.taro.repository;

import org.com.taro.entity.TaroCardEntity;
import org.com.taro.entity.TaroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaroCardRepository extends JpaRepository<TaroCardEntity, Long> {

    // cardId로 카드 찾기
    Optional<TaroCardEntity> findByCardId(Integer cardId);

    // 특정 세션의 카드들 찾기
    List<TaroCardEntity> findByTaroSession(TaroSession taroSession);

    // 특정 세션의 카드들 찾기 (세션 ID로)
    @Query("SELECT c FROM TaroCardEntity c WHERE c.taroSession.sessionId = :sessionId")
    List<TaroCardEntity> findBySessionId(@Param("sessionId") String sessionId);

    // 특정 슈트의 카드들 찾기
    List<TaroCardEntity> findBySuit(TaroCardEntity.CardSuit suit);

    // 특정 슈트와 번호로 카드 찾기
    Optional<TaroCardEntity> findBySuitAndNumber(TaroCardEntity.CardSuit suit, String number);

    // 역방향/정방향 카드들 찾기
    List<TaroCardEntity> findByIsReversed(Boolean isReversed);

    // 카드 이름으로 검색 (한국어)
    List<TaroCardEntity> findByNameKoContaining(String nameKo);

    // 카드 이름으로 검색 (영어)
    List<TaroCardEntity> findByNameEnContaining(String nameEn);

    // 특정 세션의 역방향 카드 개수
    @Query("SELECT COUNT(c) FROM TaroCardEntity c WHERE c.taroSession = :session AND c.isReversed = true")
    long countReversedCardsBySession(@Param("session") TaroSession session);

    // 랜덤 카드 선택을 위한 쿼리 (네이티브 쿼리 사용)
    @Query(value = "SELECT * FROM taro_cards WHERE taro_session_id IS NULL ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<TaroCardEntity> findRandomAvailableCards(@Param("limit") int limit);

    // 모든 사용 가능한 카드 (세션에 할당되지 않은 카드)
    @Query("SELECT c FROM TaroCardEntity c WHERE c.taroSession IS NULL")
    List<TaroCardEntity> findAvailableCards();
}