package com.project.tshop.repository;

import com.project.tshop.entity.Product;
import com.project.tshop.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    boolean existsByProductAndObjectKey(Product product, String objectKey);
}
