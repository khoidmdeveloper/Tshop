package com.project.tshop.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductListItemResponse {

    private UUID id;

    private String name;

    private String slug;

    private BigDecimal price;

    private Integer stockQuantity;

    private String thumbnail;

    private String categoryName;

    private String categorySlug;
}
