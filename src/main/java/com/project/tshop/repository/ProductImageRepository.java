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
}
