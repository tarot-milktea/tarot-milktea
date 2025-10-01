package org.com.taro.repository;

import org.com.taro.entity.LuckyCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LuckyCardRepository extends JpaRepository<LuckyCard, Integer> {
}