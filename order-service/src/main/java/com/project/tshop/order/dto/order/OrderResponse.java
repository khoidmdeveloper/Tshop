package com.project.tshop.order.dto.order;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {

    private UUID id;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;

    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String note;

    private String paymentMethod;
    private String paymentStatus;
    private String vnpayTransactionId;

    private String ghnOrderCode;

    private List<OrderItemResponse> items;

    private Instant createdAt;
    private Instant updatedAt;

    // Only included when checkout requires VNPay redirect
    private String paymentUrl;
}
