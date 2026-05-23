package com.project.tshop.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VnPayConfig {

    private String tmnCode;
    private String hashSecret;
    private String payUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private String returnUrl = "http://localhost:8081/api/payment/vnpay-return";
    private String frontendReturnUrl = "http://localhost:5173/payment/vnpay-return";
    private String version = "2.1.0";
    private String command = "pay";
    private String orderType = "other";
    private BigDecimal exchangeRate = new BigDecimal("25000");
    private int expireMinutes = 15;
}
