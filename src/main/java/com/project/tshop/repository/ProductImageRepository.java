package com.project.tshop.repository;

import com.project.tshop.dto.product.ProductImageResponse;
import com.project.tshop.entity.Product;
import com.project.tshop.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    boolean existsByProductAndObjectKey(Product product, String objectKey);

    @Query("""
            select new com.project.tshop.dto.product.ProductImageResponse(
                pi.objectKey,
                pi.altText,
                pi.sortOrder
            )
            from ProductImage pi
            where pi.product.id = :productId
            order by pi.sortOrder asc, pi.createdAt asc
            """)
    List<ProductImageResponse> findResponsesByProductId(@Param("productId") UUID productId);

    @Query("""
            select pi.id as id, pi.objectKey as value
            from ProductImage pi
            where pi.objectKey is not null and trim(pi.objectKey) <> ''
            """)
    List<ProductImagePathView> findAllObjectKeyValues();

    @org.springframework.data.jpa.repository.Modifying
    @Query("update ProductImage pi set pi.objectKey = :objectKey where pi.id = :id")
    int updateObjectKeyById(@Param("id") UUID id, @Param("objectKey") String objectKey);

    interface ProductImagePathView {
        UUID getId();

        String getValue();
    }
}
