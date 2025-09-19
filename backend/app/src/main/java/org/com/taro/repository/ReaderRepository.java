package org.com.taro.repository;

import org.com.taro.entity.Reader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReaderRepository extends JpaRepository<Reader, String> {

    Optional<Reader> findByType(String type);

    List<Reader> findByNameContaining(String name);

    boolean existsByType(String type);
}