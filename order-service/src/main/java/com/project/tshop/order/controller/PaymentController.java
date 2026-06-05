package com.project.tshop.order.controller;

import com.project.tshop.order.config.VnPayConfig;
import com.project.tshop.order.dto.order.OrderResponse;
import com.project.tshop.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;
    private final VnPayConfig vnPayConfig;

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(HttpServletRequest request) {
        try {
            OrderResponse order = orderService.handleVnPayReturn(request);

            String message = "paid".equals(order.getPaymentStatus())
                    ? "Payment successful"
                    : "Payment failed";

            return redirectToFrontend(buildSuccessRedirect(request, order, message));
        } catch (ResponseStatusException ex) {
            return redirectToFrontend(buildFailureRedirect(request, ex.getReason()));
        } catch (Exception ex) {
            return redirectToFrontend(buildFailureRedirect(request, "Payment verification failed"));
        }
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(HttpServletRequest request) {
        return ResponseEntity.ok(orderService.handleVnPayIpn(request));
    }

    private ResponseEntity<Void> redirectToFrontend(URI location) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(location)
                .build();
    }

    private URI buildSuccessRedirect(HttpServletRequest request, OrderResponse order, String message) {
        UriComponentsBuilder builder = baseFrontendRedirect()
                .queryParam("status", order.getStatus())
                .queryParam("paymentStatus", order.getPaymentStatus())
                .queryParam("orderId", order.getId())
                .queryParam("message", message);

        appendVnPayParam(builder, request, "vnp_ResponseCode");
        appendVnPayParam(builder, request, "vnp_TransactionStatus");
        appendVnPayParam(builder, request, "vnp_TxnRef");
        appendVnPayParam(builder, request, "vnp_TransactionNo");

        return builder.build().encode().toUri();
    }

    private URI buildFailureRedirect(HttpServletRequest request, String message) {
        UriComponentsBuilder builder = baseFrontendRedirect()
                .queryParam("status", "cancelled")
                .queryParam("paymentStatus", "failed")
                .queryParam("message", message != null && !message.isBlank()
                        ? message
                        : "Payment verification failed");

        appendVnPayParam(builder, request, "vnp_ResponseCode");
        appendVnPayParam(builder, request, "vnp_TransactionStatus");
        appendVnPayParam(builder, request, "vnp_TxnRef");
        appendVnPayParam(builder, request, "vnp_TransactionNo");

        return builder.build().encode().toUri();
    }

    private UriComponentsBuilder baseFrontendRedirect() {
        return UriComponentsBuilder.fromUriString(vnPayConfig.getFrontendReturnUrl());
    }

    private void appendVnPayParam(UriComponentsBuilder builder, HttpServletRequest request, String paramName) {
        String value = request.getParameter(paramName);
        if (value != null && !value.isBlank()) {
            builder.queryParam(paramName, value);
        }
    }
}
