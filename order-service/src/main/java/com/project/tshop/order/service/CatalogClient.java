package com.project.tshop.order.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class CatalogClient {

    private final RestClient restClient;
    private final String catalogServiceUrl;
    private final String internalSecret;

    public CatalogClient(RestClient restClient, 
                         @Value("${catalog-service.url}") String catalogServiceUrl,
                         @Value("${internal.secret}") String internalSecret) {
        this.restClient = restClient;
        this.catalogServiceUrl = catalogServiceUrl;
        this.internalSecret = internalSecret;
    }

    public ProductDetail getProduct(UUID productId) {
        try {
            ApiResponse<ProductDetail> response = restClient.get()
                    .uri(catalogServiceUrl + "/api/products/{id}", productId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.isSuccess()) {
                return response.getData();
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found in catalog");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not fetch product from catalog", e);
        }
    }

    public List<ProductDetail> getBatchProducts(List<UUID> productIds) {
        try {
            ApiResponse<List<ProductDetail>> response = restClient.post()
                    .uri(catalogServiceUrl + "/api/products/batch")
                    .header("X-Internal-Secret", internalSecret)
                    .body(productIds)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            if (response != null && response.isSuccess()) {
                return response.getData();
            }
            return List.of();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not fetch products from catalog", e);
        }
    }

    public void deductStock(Map<UUID, Integer> updates) {
        try {
            restClient.post()
                    .uri(catalogServiceUrl + "/api/products/stock/deduct")
                    .header("X-Internal-Secret", internalSecret)
                    .body(updates)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not deduct stock, insufficient quantity or service unavailable", e);
        }
    }

    public void restoreStock(Map<UUID, Integer> updates) {
        try {
            restClient.post()
                    .uri(catalogServiceUrl + "/api/products/stock/restore")
                    .header("X-Internal-Secret", internalSecret)
                    .body(updates)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Could not restore stock in catalog service", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not restore stock, service unavailable", e);
        }
    }

    @Data
    public static class ProductDetail {
        private UUID id;
        private String name;
        private BigDecimal price;
        private Integer stockQuantity;
        private String thumbnail;
        private String status;
    }

    @Data
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
    }
}
