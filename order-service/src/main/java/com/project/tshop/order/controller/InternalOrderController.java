package com.project.tshop.order.controller;

import com.project.tshop.order.dto.order.OrderStatsResponse;
import com.project.tshop.order.dto.response.ApiResponse;
import com.project.tshop.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

/**
 * Internal-only endpoint for service-to-service communication.
 * Protected by X-Internal-Secret header (same pattern as catalog-service).
 */
@RestController
@RequestMapping("/api/internal/orders")
@RequiredArgsConstructor
public class InternalOrderController {

    private final OrderRepository orderRepository;

    @Value("${internal.secret}")
    private String expectedInternalSecret;

    private void verifyInternalSecret(String secret) {
        if (!expectedInternalSecret.equals(secret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid internal secret");
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getOrderStats(
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret,
            @RequestParam String userEmail) {
        verifyInternalSecret(secret);

        long totalOrders = orderRepository.countByUserEmail(userEmail);
        BigDecimal totalSpent = orderRepository.sumTotalAmountByUserEmail(userEmail);

        OrderStatsResponse stats = OrderStatsResponse.builder()
                .totalOrders(totalOrders)
                .totalSpent(totalSpent != null ? totalSpent : BigDecimal.ZERO)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
