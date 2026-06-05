package com.project.tshop.catalog.repository;

import com.project.tshop.catalog.dto.product.ProductDetailResponse;
import com.project.tshop.catalog.dto.product.ProductListItemResponse;
import com.project.tshop.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsBySlug(String slug);

    Optional<Product> findFirstBySlug(String slug);

    @Query("""
            select new com.project.tshop.catalog.dto.product.ProductListItemResponse(
                p.id, p.name, p.slug, p.price, p.stockQuantity, p.thumbnail, c.name, c.slug
            )
            from Product p
            left join p.category c
            where (:search is null or :search = ''
                or lower(p.name) like lower(concat('%', :search, '%'))
                or lower(p.slug) like lower(concat('%', :search, '%')))
              and (:categorySlug is null or :categorySlug = '' or c.slug = :categorySlug)
            """)
    Page<ProductListItemResponse> search(
            @Param("search") String search,
            @Param("categorySlug") String categorySlug,
            Pageable pageable
    );

    @Query("""
            select new com.project.tshop.catalog.dto.product.ProductDetailResponse(
                p.id, p.name, p.slug, p.price, p.stockQuantity, p.description,
                p.thumbnail, c.id, c.name, c.slug, p.status
            )
            from Product p
            left join p.category c
            where p.id = :id
            """)
    Optional<ProductDetailResponse> findDetailById(@Param("id") UUID id);

    @Query("""
            select new com.project.tshop.catalog.dto.product.ProductDetailResponse(
                p.id, p.name, p.slug, p.price, p.stockQuantity, p.description,
                p.thumbnail, c.id, c.name, c.slug, p.status
            )
            from Product p
            left join p.category c
            where p.slug = :slug
            """)
    Optional<ProductDetailResponse> findDetailBySlug(@Param("slug") String slug);

    @Modifying
    @Query("update Product p set p.thumbnail = :thumbnail where p.slug = :slug")
    void updateThumbnailBySlug(@Param("slug") String slug, @Param("thumbnail") String thumbnail);

    @Modifying
    @Query("update Product p set p.stockQuantity = :qty where p.id = :id")
    int updateStockById(@Param("id") UUID id, @Param("qty") int qty);

    @Modifying
    @Query("update Product p set p.stockQuantity = p.stockQuantity - :quantity where p.id = :id and p.stockQuantity >= :quantity")
    int deductStock(@Param("id") UUID id, @Param("quantity") int quantity);

    @Modifying
    @Query("update Product p set p.stockQuantity = p.stockQuantity + :quantity where p.id = :id")
    int restoreStock(@Param("id") UUID id, @Param("quantity") int quantity);

    @Query("""
            select new com.project.tshop.catalog.dto.product.ProductDetailResponse(
                p.id, p.name, p.slug, p.price, p.stockQuantity, p.description,
                p.thumbnail, c.id, c.name, c.slug, p.status
            )
            from Product p
            left join p.category c
            where p.id in :ids
            """)
    List<ProductDetailResponse> findDetailsByIds(@Param("ids") List<UUID> ids);
}
