package com.project.tshop.order.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponse {

    private UUID id;
    private UUID productId;
    private String productName;
    private String productThumbnail;
    private BigDecimal productPrice;
    private Integer stockQuantity;
    private Integer quantity;
    private BigDecimal subtotal;
}
