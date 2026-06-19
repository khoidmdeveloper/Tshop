package com.project.tshop.catalog.dto.product;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Data @NoArgsConstructor @AllArgsConstructor
public class ProductImageResponse { private String url; private String altText; private Integer sortOrder; }
