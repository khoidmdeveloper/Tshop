package com.project.tshop.catalog.dto.product;
import java.util.UUID;
import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Data @NoArgsConstructor @AllArgsConstructor
public class ProductListItemResponse { private UUID id; private String name; private String slug; private BigDecimal price; private Integer stockQuantity; private String thumbnail; private String categoryName; private String categorySlug; }
