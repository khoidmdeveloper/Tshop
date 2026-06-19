package com.project.tshop.catalog.dto.product;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.math.BigDecimal;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data @NoArgsConstructor
public class ProductDetailResponse {
    private UUID id; private String name; private String slug; private BigDecimal price;
    private Integer stockQuantity; private String description; private String thumbnail;
    private UUID categoryId; private String categoryName; private String categorySlug; private String status;
    private List<ProductImageResponse> images = new ArrayList<>();
    public ProductDetailResponse(UUID id, String name, String slug, BigDecimal price, Integer stockQuantity,
        String description, String thumbnail, UUID categoryId, String categoryName, String categorySlug, String status) {
        this.id=id; this.name=name; this.slug=slug; this.price=price; this.stockQuantity=stockQuantity;
        this.description=description; this.thumbnail=thumbnail; this.categoryId=categoryId;
        this.categoryName=categoryName; this.categorySlug=categorySlug; this.status=status;
    }
}
