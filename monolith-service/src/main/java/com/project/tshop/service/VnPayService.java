package com.project.tshop.service;

import com.project.tshop.config.VnPayConfig;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TimeZone;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService {

    private final VnPayConfig vnPayConfig;

    /**
     * Create VNPay payment URL for an order.
     */
    public String createPaymentUrl(UUID orderId, BigDecimal totalAmount, String orderInfo, String ipAddress) {
        validateRequiredConfig();

        Map<String, String> vnpParams = new HashMap<>();

        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(calculateVnpAmount(totalAmount)));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", buildTxnRef(orderId));
        vnpParams.put("vnp_OrderInfo", normalizeOrderInfo(orderInfo, orderId));
        vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", normalizeIpAddress(ipAddress));

        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String createDate = formatter.format(cal.getTime());
        vnpParams.put("vnp_CreateDate", createDate);

        cal.add(Calendar.MINUTE, vnPayConfig.getExpireMinutes());
        String expireDate = formatter.format(cal.getTime());
        vnpParams.put("vnp_ExpireDate", expireDate);

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                try {
                    String encodedKey = URLEncoder.encode(fieldName, StandardCharsets.US_ASCII);
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII);

                    if (!hashData.isEmpty()) {
                        hashData.append('&');
                        query.append('&');
                    }

                    hashData.append(fieldName).append('=').append(encodedValue);
                    query.append(encodedKey).append('=').append(encodedValue);
                } catch (Exception e) {
                    throw new IllegalStateException("Unable to encode VNPay parameters", e);
                }
            }
        }

        String hashDataStr = hashData.toString();
        log.info("[VNPay] hashData: {}", hashDataStr);

        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashDataStr);
        log.info("[VNPay] secureHash: {}", secureHash);

        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = vnPayConfig.getPayUrl() + "?" + query;
        log.info("[VNPay] paymentUrl: {}", paymentUrl);
        return paymentUrl;
    }

    public String buildTxnRef(UUID orderId) {
        return orderId.toString().replace("-", "").substring(0, 20);
    }

    public boolean validatePaymentResponse(Map<String, String> params, BigDecimal totalAmount) {
        String receivedTmnCode = params.get("vnp_TmnCode");
        String receivedAmount = params.get("vnp_Amount");
        return Objects.equals(vnPayConfig.getTmnCode(), receivedTmnCode)
                && Objects.equals(String.valueOf(calculateVnpAmount(totalAmount)), receivedAmount);
    }

    /**
     * Verify VNPay return/IPN parameters.
     *
     * @return the decoded params map if valid, null if invalid
     */
    public Map<String, String> verifyPayment(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        Map<String, String> decodedParams = new HashMap<>();

        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String paramName = params.nextElement();
            String paramValue = request.getParameter(paramName);
            decodedParams.put(paramName, paramValue);
            if (paramValue != null && !paramValue.isEmpty()) {
                fields.put(paramName, paramValue);
            }
        }

        String receivedHash = request.getParameter("vnp_SecureHash");
        if (!StringUtils.hasText(receivedHash)) {
            return null;
        }

        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");
        fields.entrySet().removeIf(entry -> !entry.getKey().startsWith("vnp_"));

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (StringUtils.hasText(fieldValue)) {
                try {
                    if (!hashData.isEmpty()) {
                        hashData.append('&');
                    }
                    hashData.append(fieldName)
                            .append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                } catch (Exception e) {
                    throw new IllegalStateException("Unable to encode VNPay return parameters", e);
                }
            }
        }

        String hashDataStr = hashData.toString();
        log.info("[VNPay Verify] hashData: {}", hashDataStr);

        String calculatedHash = hmacSHA512(vnPayConfig.getHashSecret(), hashDataStr);
        log.info("[VNPay Verify] calculatedHash: {}", calculatedHash);
        log.info("[VNPay Verify] receivedHash:   {}", receivedHash);

        if (calculatedHash.equalsIgnoreCase(receivedHash)) {
            return decodedParams;
        }
        return null;
    }

    /**
     * Check if payment was successful based on VNPay response code.
     */
    public boolean isPaymentSuccess(Map<String, String> params) {
        String responseCode = params.get("vnp_ResponseCode");
        return "00".equals(responseCode);
    }

    private String normalizeIpAddress(String ipAddress) {
        if (!StringUtils.hasText(ipAddress)) {
            return "127.0.0.1";
        }
        if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "::1".equals(ipAddress)) {
            return "127.0.0.1";
        }
        if (ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        if (ipAddress.length() > 45) {
            return "127.0.0.1";
        }
        return ipAddress;
    }

    private void validateRequiredConfig() {
        if (!StringUtils.hasText(vnPayConfig.getTmnCode())) {
            throw new IllegalStateException("VNPay tmnCode is not configured");
        }
        if (!StringUtils.hasText(vnPayConfig.getHashSecret())) {
            throw new IllegalStateException("VNPay hashSecret is not configured");
        }
        if (!StringUtils.hasText(vnPayConfig.getReturnUrl())) {
            throw new IllegalStateException("VNPay returnUrl is not configured");
        }
    }

    private long calculateVnpAmount(BigDecimal totalAmount) {
        return totalAmount
                .multiply(vnPayConfig.getExchangeRate())
                .multiply(new BigDecimal("100"))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }

    private String normalizeOrderInfo(String orderInfo, UUID orderId) {
        String fallback = "Thanh toan don hang Tshop " + orderId.toString().substring(0, 8);
        String source = StringUtils.hasText(orderInfo) ? orderInfo.trim() : fallback;
        String ascii = Normalizer.normalize(source, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return ascii.isEmpty() ? fallback : ascii;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }
}
