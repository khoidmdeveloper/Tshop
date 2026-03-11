package com.project.tshop.service;

import com.project.tshop.config.GhnConfig;
import com.project.tshop.dto.shipping.ShippingFeeRequest;
import com.project.tshop.dto.shipping.ShippingFeeResponse;
import com.project.tshop.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GhnService {

    private final GhnConfig ghnConfig;
    private final RestClient restClient;

    /**
     * Calculate shipping fee via GHN API.
     */
    public ShippingFeeResponse calculateShippingFee(ShippingFeeRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("service_type_id", 2); // standard delivery
        body.put("from_district_id", ghnConfig.getFromDistrictId());
        body.put("to_district_id", request.getToDistrictId());
        body.put("to_ward_code", request.getToWardCode());
        body.put("weight", request.getWeight() != null ? request.getWeight() : 500);
        body.put("insurance_value", request.getInsuranceValue() != null ? request.getInsuranceValue() : 0);
        body.put("length", 30);
        body.put("width", 20);
        body.put("height", 10);

        try {
            Map<String, Object> response = restClient.post()
                    .uri(ghnConfig.getApiUrl() + "/shipping-order/fee")
                    .header("Token", ghnConfig.getToken())
                    .header("ShopId", String.valueOf(ghnConfig.getShopId()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response != null && response.get("data") instanceof Map<?, ?> data) {
                return ShippingFeeResponse.builder()
                        .total(toInteger(data.get("total")))
                        .serviceFee(toInteger(data.get("service_fee")))
                        .insuranceFee(toInteger(data.get("insurance_fee")))
                        .build();
            }
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Cannot calculate shipping fee");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("GHN calculate fee error: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Shipping service unavailable: " + e.getMessage());
        }
    }

    /**
     * Create a shipping order on GHN.
     */
    public String createShippingOrder(Order order) {
        Map<String, Object> body = new HashMap<>();
        body.put("to_name", order.getReceiverName());
        body.put("to_phone", order.getReceiverPhone());
        body.put("to_address", order.getShippingAddress());
        body.put("to_district_id", order.getDistrictId());
        body.put("to_ward_code", order.getWardCode());
        body.put("weight", 500); // default 500g
        body.put("length", 30);
        body.put("width", 20);
        body.put("height", 10);
        body.put("service_type_id", 2);
        body.put("payment_type_id", "cod".equals(order.getPaymentMethod()) ? 2 : 1); // 1=seller pays, 2=buyer pays
        body.put("required_note", "CHOXEMHANGKHONGTHU");
        body.put("cod_amount", "cod".equals(order.getPaymentMethod()) ? order.getTotalAmount().intValue() : 0);
        body.put("client_order_code", order.getId().toString());
        body.put("content", "Tshop Order #" + order.getId().toString().substring(0, 8));

        // Items
        List<Map<String, Object>> ghnItems = order.getItems().stream().map(item -> {
            Map<String, Object> ghnItem = new HashMap<>();
            ghnItem.put("name", item.getProductName());
            ghnItem.put("quantity", item.getQuantity());
            ghnItem.put("price", item.getUnitPrice().intValue());
            return ghnItem;
        }).toList();
        body.put("items", ghnItems);

        try {
            Map<String, Object> response = restClient.post()
                    .uri(ghnConfig.getApiUrl() + "/shipping-order/create")
                    .header("Token", ghnConfig.getToken())
                    .header("ShopId", String.valueOf(ghnConfig.getShopId()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response != null && response.get("data") instanceof Map<?, ?> data) {
                Object orderCode = data.get("order_code");
                return orderCode != null ? orderCode.toString() : null;
            }
            log.warn("GHN create order returned unexpected response: {}", response);
            return null;
        } catch (Exception e) {
            log.error("GHN create shipping order error: {}", e.getMessage(), e);
            // Don't fail the order creation if GHN fails — can retry later
            return null;
        }
    }

    /**
     * Get list of provinces from GHN.
     */
    public Object getProvinces() {
        return callGhnGet("/master-data/province");
    }

    /**
     * Get districts by province ID.
     */
    public Object getDistricts(int provinceId) {
        Map<String, Object> body = Map.of("province_id", provinceId);
        return callGhnPost("/master-data/district", body);
    }

    /**
     * Get wards by district ID.
     */
    public Object getWards(int districtId) {
        Map<String, Object> body = Map.of("district_id", districtId);
        return callGhnPost("/master-data/ward", body);
    }

    // --- Helpers ---

    private Object callGhnGet(String path) {
        String url = buildGhnUrl(path);
        log.info("GHN API GET {}", url);
        try {
            Map<String, Object> response = restClient.get()
                    .uri(url)
                    .header("Token", ghnConfig.getToken())
                    .header("Content-Type", "application/json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {
                    });
            return response != null ? response.get("data") : null;
        } catch (Exception e) {
            log.error("GHN API GET {} error: {}", url, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Shipping service unavailable");
        }
    }

    private Object callGhnPost(String path, Map<String, Object> body) {
        String url = buildGhnUrl(path);
        log.info("GHN API POST {} body: {}", url, body);
        try {
            Map<String, Object> response = restClient.post()
                    .uri(url)
                    .header("Token", ghnConfig.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {
                    });
            return response != null ? response.get("data") : null;
        } catch (Exception e) {
            log.error("GHN API POST {} error: {}", url, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Shipping service unavailable");
        }
    }

    private Integer toInteger(Object value) {
        if (value == null)
            return 0;
        if (value instanceof Number n)
            return n.intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /**
     * Build GHN API URL.
     * Master data APIs use a different base path compared to shipping orders.
     */
    private String buildGhnUrl(String path) {
        if (path.startsWith("/master-data")) {
            // Replace /v2 with nothing for master data
            String baseUrl = ghnConfig.getApiUrl().replace("/v2", "");
            return baseUrl + path;
        }
        return ghnConfig.getApiUrl() + path;
    }
}
