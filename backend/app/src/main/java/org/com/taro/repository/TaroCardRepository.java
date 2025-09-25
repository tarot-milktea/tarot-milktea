package org.com.taro.repository;

import org.com.taro.entity.TaroCardEntity;
import org.com.taro.enums.CardSuit;
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

    // 특정 슈트의 카드들 찾기
    List<TaroCardEntity> findBySuit(CardSuit suit);

    // 특정 슈트와 번호로 카드 찾기
    Optional<TaroCardEntity> findBySuitAndNumber(CardSuit suit, String number);

    // 카드 이름으로 검색 (한국어)
    List<TaroCardEntity> findByNameKoContaining(String nameKo);

    // 카드 이름으로 검색 (영어)
    List<TaroCardEntity> findByNameEnContaining(String nameEn);

    // 랜덤 카드 선택을 위한 쿼리 (MySQL용 RAND() 함수 사용)
    @Query(value = "SELECT * FROM taro_cards ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<TaroCardEntity> findRandomCards(@Param("limit") int limit);

    // 모든 카드 조회
    List<TaroCardEntity> findAll();
}