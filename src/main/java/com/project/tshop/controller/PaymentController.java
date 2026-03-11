package com.project.tshop.controller;

import com.project.tshop.config.VnPayConfig;
import com.project.tshop.dto.order.OrderResponse;
import com.project.tshop.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import com.project.tshop.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor

public class PaymentController {

    private final OrderService orderService;
    private final VnPayConfig vnPayConfig;

    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<OrderResponse>> vnpayReturn(HttpServletRequest request) {
        OrderResponse order = orderService.handleVnPayReturn(request);

        String message = "paid".equals(order.getPaymentStatus())
                ? "Payment successful"
                : "Payment failed";

        return ResponseEntity.ok(ApiResponse.success(order, message));
    }

    @GetMapping("/vnpay-ipn")
    public org.springframework.http.ResponseEntity<Map<String, String>> vnpayIpn(HttpServletRequest request) {
        return org.springframework.http.ResponseEntity.ok(orderService.handleVnPayIpn(request));
    }
}
