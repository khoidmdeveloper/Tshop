package com.project.tshop.repository;

import com.project.tshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsBySlug(String slug);

    Optional<Product> findFirstBySlug(String slug);

    @Modifying
    @Query("update Product p set p.thumbnail = :thumbnail where p.slug = :slug")
    void updateThumbnailBySlug(@Param("slug") String slug, @Param("thumbnail") String thumbnail);
}
