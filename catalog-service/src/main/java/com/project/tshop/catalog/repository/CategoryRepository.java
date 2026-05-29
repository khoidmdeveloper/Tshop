package com.project.tshop.catalog.repository;

import com.project.tshop.catalog.dto.category.CategoryResponse;
import com.project.tshop.catalog.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findFirstBySlug(String slug);

    @Query("""
            select new com.project.tshop.catalog.dto.category.CategoryResponse(
                c.id, c.name, c.slug, p.id
            )
            from Category c
            left join c.parent p
            where c.id = :id
            """)
    Optional<CategoryResponse> findResponseById(@Param("id") UUID id);

    @Query("""
            select new com.project.tshop.catalog.dto.category.CategoryResponse(
                c.id, c.name, c.slug, p.id
            )
            from Category c
            left join c.parent p
            where c.slug = :slug
            """)
    Optional<CategoryResponse> findResponseBySlug(@Param("slug") String slug);

    @Query("""
            select new com.project.tshop.catalog.dto.category.CategoryResponse(
                c.id, c.name, c.slug, p.id
            )
            from Category c
            left join c.parent p
            where (:search is null or :search = ''
                or lower(c.name) like lower(concat('%', :search, '%'))
                or lower(c.slug) like lower(concat('%', :search, '%')))
            """)
    Page<CategoryResponse> search(@Param("search") String search, Pageable pageable);

    boolean existsBySlug(String slug);

    @Modifying
    @Query("""
            update Category c
            set c.name = :name,
                c.slug = :slug,
                c.parent = :parent
            where c.id = :id
            """)
    void updateCategory(
            @Param("id") UUID id,
            @Param("name") String name,
            @Param("slug") String slug,
            @Param("parent") Category parent
    );
}
