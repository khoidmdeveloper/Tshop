package com.project.tshop.auth.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

/**
 * Client for fetching order statistics from order-service.
 * Uses X-Internal-Secret header for service-to-service authentication.
 * Falls back to zero values if order-service is unreachable.
 */
@Service
@Slf4j
public class OrderStatsClient {

    private final RestClient restClient;
    private final String orderServiceUrl;
    private final String internalSecret;

    public OrderStatsClient(RestClient restClient,
                            @Value("${order-service.url}") String orderServiceUrl,
                            @Value("${internal.secret}") String internalSecret) {
        this.restClient = restClient;
        this.orderServiceUrl = orderServiceUrl;
        this.internalSecret = internalSecret;
    }

    public OrderStats getOrderStats(String userEmail) {
        try {
            ApiResponse<OrderStats> response = restClient.get()
                    .uri(orderServiceUrl + "/api/internal/orders/stats?userEmail={email}", userEmail)
                    .header("X-Internal-Secret", internalSecret)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.isSuccess() && response.getData() != null) {
                return response.getData();
            }
            log.warn("Order stats returned unsuccessful response for user: {}", userEmail);
        } catch (Exception e) {
            log.warn("Could not fetch order stats from order-service for user: {}. Falling back to 0. Error: {}",
                    userEmail, e.getMessage());
        }
        return OrderStats.fallback();
    }

    @Data
    public static class OrderStats {
        private long totalOrders;
        private BigDecimal totalSpent;

        public static OrderStats fallback() {
            OrderStats stats = new OrderStats();
            stats.totalOrders = 0L;
            stats.totalSpent = BigDecimal.ZERO;
            return stats;
        }
    }

    @Data
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
    }
}
