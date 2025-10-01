package org.com.taro.repository;

import org.com.taro.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    Optional<Category> findByCode(String code);

    List<Category> findByNameContaining(String name);

    @Query("SELECT c FROM Category c JOIN FETCH c.topics ORDER BY c.createdAt")
    List<Category> findAllWithTopics();

    boolean existsByCode(String code);
}