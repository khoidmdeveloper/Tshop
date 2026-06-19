package com.project.tshop.order.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VnPayConfig {
    private String tmnCode;
    private String hashSecret;
    private String payUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private String returnUrl;
    private String frontendReturnUrl;
    private String version = "2.1.0";
    private String command = "pay";
    private String orderType = "other";
    private int expireMinutes = 15;
    private BigDecimal exchangeRate = new BigDecimal("25000");
}
