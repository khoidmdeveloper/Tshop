package com.project.tshop.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductCreateRequest {

    @NotNull(message = "Category is required")
    private UUID categoryId;

    @NotBlank(message = "Name is required")
    private String name;

    private String slug;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity must be 0 or greater")
    private Integer stockQuantity;

    private String description;

    private String status;
}
