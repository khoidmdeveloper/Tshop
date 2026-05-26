package com.project.tshop.catalog.dto.product;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;
import jakarta.validation.constraints.Min;
@Data
public class ProductCreateRequest {
    @NotNull(message="Category is required") private UUID categoryId;
    @NotBlank(message="Name is required") private String name;
    private String slug;
    @NotNull(message="Price is required") @DecimalMin(value="0.01",message="Price must be greater than 0") private BigDecimal price;
    @NotNull(message="Stock quantity is required") @Min(value=0,message="Stock quantity must be 0 or greater") private Integer stockQuantity;
    private String description; private String status;
}
