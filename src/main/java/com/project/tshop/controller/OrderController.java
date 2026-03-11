package com.project.tshop.controller;

import com.project.tshop.dto.order.CheckoutRequest;
import com.project.tshop.dto.order.OrderResponse;
import com.project.tshop.dto.response.ApiResponse;
import com.project.tshop.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            Authentication auth,
            @Valid @RequestBody CheckoutRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        OrderResponse order = orderService.checkout(auth.getName(), request, ipAddress);
        String message = order.getPaymentUrl() != null
                ? "Order created. Redirect to payment URL to complete payment."
                : "Order placed successfully";
        return ResponseEntity.ok(ApiResponse.success(order, message));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrders(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderResponse> orders = orderService.getOrders(auth.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success(orders, "Orders retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(
            Authentication auth,
            @PathVariable UUID id) {
        OrderResponse order = orderService.getOrderDetail(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(order, "Order detail retrieved"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            Authentication auth,
            @PathVariable UUID id) {
        OrderResponse order = orderService.cancelOrder(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(order, "Order cancelled"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
