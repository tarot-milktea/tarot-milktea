package org.com.taro.repository;

import org.com.taro.entity.DrawnCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrawnCardRepository extends JpaRepository<DrawnCard, Integer> {

    List<DrawnCard> findByReadingId(Integer readingId);

    List<DrawnCard> findByCardId(Integer cardId);

    List<DrawnCard> findByOrientation(DrawnCard.Orientation orientation);

    @Query("SELECT dc FROM DrawnCard dc WHERE dc.readingId = :readingId ORDER BY dc.position")
    List<DrawnCard> findByReadingIdOrderByPosition(@Param("readingId") Integer readingId);

    @Query("SELECT COUNT(dc) FROM DrawnCard dc WHERE dc.readingId = :readingId AND dc.orientation = :orientation")
    long countByReadingIdAndOrientation(@Param("readingId") Integer readingId, @Param("orientation") DrawnCard.Orientation orientation);
}