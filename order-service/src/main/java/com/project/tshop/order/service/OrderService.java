package com.project.tshop.order.service;

import java.math.RoundingMode;

import com.project.tshop.order.config.VnPayConfig;
import com.project.tshop.order.dto.order.CheckoutRequest;
import com.project.tshop.order.dto.order.OrderItemResponse;
import com.project.tshop.order.dto.order.OrderResponse;
import com.project.tshop.order.dto.shipping.ShippingFeeRequest;
import com.project.tshop.order.dto.shipping.ShippingFeeResponse;
import com.project.tshop.order.entity.Cart;
import com.project.tshop.order.entity.CartItem;
import com.project.tshop.order.entity.Order;
import com.project.tshop.order.entity.OrderItem;
import com.project.tshop.order.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private static final int DEFAULT_ITEM_WEIGHT_GRAMS = 500;

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final VnPayService vnPayService;
    private final GhnService ghnService;
    private final VnPayConfig vnPayConfig;
    private final CatalogClient catalogClient;

    @Transactional
    public OrderResponse checkout(String userEmail, CheckoutRequest request, String ipAddress) {
        Cart cart = cartService.getOrCreateCart(userEmail);

        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        ShippingFeeRequest feeRequest = new ShippingFeeRequest();
        feeRequest.setToDistrictId(request.getDistrictId());
        feeRequest.setToWardCode(request.getWardCode());

        BigDecimal cartTotal = BigDecimal.ZERO;
        int totalWeight = 0;
        
        List<OrderItem> orderItems = new ArrayList<>();
        Map<UUID, Integer> stockDeductions = new HashMap<>();
        List<UUID> productIds = cart.getItems().stream().map(CartItem::getProductId).toList();
        List<CatalogClient.ProductDetail> products = catalogClient.getBatchProducts(productIds);
        Map<UUID, CatalogClient.ProductDetail> productMap = products.stream()
                .collect(Collectors.toMap(CatalogClient.ProductDetail::getId, p -> p));
        
        for (CartItem cartItem : cart.getItems()) {
            CatalogClient.ProductDetail product = productMap.get(cartItem.getProductId());
            if (product == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found: " + cartItem.getProductId());
            }
            
            int quantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 1;
            if (product.getStockQuantity() != null && quantity > product.getStockQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for product: " + product.getName()
                                + ". Available: " + product.getStockQuantity());
            }
            
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            
            cartTotal = cartTotal.add(itemTotal);
            totalWeight += DEFAULT_ITEM_WEIGHT_GRAMS * quantity;
            
            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productThumbnail(product.getThumbnail())
                    .unitPrice(product.getPrice())
                    .quantity(quantity)
                    .totalPrice(itemTotal)
                    .build();
            orderItems.add(orderItem);
            stockDeductions.put(product.getId(), quantity);
        }
        
        catalogClient.deductStock(stockDeductions);
        
        try {
            feeRequest.setWeight(Math.max(DEFAULT_ITEM_WEIGHT_GRAMS, totalWeight));
            feeRequest.setInsuranceValue(cartTotal.multiply(vnPayConfig.getExchangeRate()).intValue());

            ShippingFeeResponse shippingFee = ghnService.calculateShippingFee(feeRequest);

            BigDecimal shippingFeeAmount = BigDecimal.valueOf(shippingFee.getTotal())
                    .divide(new BigDecimal("25000"), 2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = cartTotal.add(shippingFeeAmount);

            Order order = Order.builder()
                    .userEmail(userEmail)
                    .status("cod".equals(request.getPaymentMethod()) ? "confirmed" : "pending")
                    .totalAmount(totalAmount)
                    .shippingFee(shippingFeeAmount)
                    .receiverName(request.getReceiverName().trim())
                    .receiverPhone(request.getReceiverPhone().trim())
                    .shippingAddress(request.getShippingAddress().trim())
                    .districtId(request.getDistrictId())
                    .wardCode(request.getWardCode())
                    .note(request.getNote())
                    .paymentMethod(request.getPaymentMethod())
                    .paymentStatus("pending")
                    .items(new ArrayList<>())
                    .build();

            for (OrderItem orderItem : orderItems) {
                orderItem.setOrder(order);
                order.getItems().add(orderItem);
            }

            orderRepository.save(order);
            
            if ("vnpay".equals(request.getPaymentMethod())) {
                order.setVnpayTxnRef(vnPayService.buildTxnRef(order.getId()));
                orderRepository.save(order);
            }

            cartService.clearCart(userEmail);

            OrderResponse response = toOrderResponse(order);

            if ("vnpay".equals(request.getPaymentMethod())) {
                String orderInfo = "Thanh toan don hang Tshop " + order.getId().toString().substring(0, 8);
                String paymentUrl = vnPayService.createPaymentUrl(order.getId(), order.getTotalAmount(), orderInfo, ipAddress);
                response.setPaymentUrl(paymentUrl);
            } else {
                try {
                    String ghnOrderCode = ghnService.createShippingOrder(order);
                    if (ghnOrderCode != null) {
                        order.setGhnOrderCode(ghnOrderCode);
                        orderRepository.save(order);
                        response.setGhnOrderCode(ghnOrderCode);
                    }
                } catch (Exception e) {
                    log.warn("Could not create GHN order for {}: {}", order.getId(), e.getMessage());
                }
            }

            return response;
        } catch (Exception ex) {
            catalogClient.restoreStock(stockDeductions);
            throw ex;
        }
    }

    @Transactional
    public OrderResponse handleVnPayReturn(HttpServletRequest request) {
        Map<String, String> params = vnPayService.verifyPayment(request);
        if (params == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment signature");
        }

        String txnRef = params.get("vnp_TxnRef");
        Order order = findOrderByTxnRef(txnRef);

        if (!vnPayService.validatePaymentResponse(params, order.getTotalAmount())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment data");
        }

        if (isVnPayOrderFinalized(order)) {
            return toOrderResponse(order);
        }

        applyVnPayResult(order, params);
        orderRepository.save(order);
        return toOrderResponse(order);
    }

    @Transactional
    public Map<String, String> handleVnPayIpn(HttpServletRequest request) {
        Map<String, String> params = vnPayService.verifyPayment(request);
        if (params == null) {
            return ipnResponse("97", "Invalid signature");
        }

        String txnRef = params.get("vnp_TxnRef");
        if (txnRef == null || txnRef.isBlank()) {
            return ipnResponse("99", "Invalid request");
        }

        Order order = orderRepository.findByVnpayTxnRef(txnRef).orElse(null);
        if (order == null) {
            return ipnResponse("01", "Order not found");
        }

        if (!vnPayService.validatePaymentResponse(params, order.getTotalAmount())) {
            return ipnResponse("04", "Invalid amount");
        }

        if (isVnPayOrderFinalized(order)) {
            return ipnResponse("02", "Order already processed");
        }

        applyVnPayResult(order, params);
        orderRepository.save(order);
        return ipnResponse("00", "Confirm Success");
    }

    @Transactional
    public Page<OrderResponse> getOrders(String userEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 20));
        Page<Order> orders = orderRepository.findByUserEmailOrderByCreatedAtDesc(userEmail, pageable);
        expirePendingVnPayOrders(orders.getContent());
        return orders.map(this::toOrderResponse);
    }

    @Transactional
    public OrderResponse getOrderDetail(String userEmail, UUID orderId) {
        Order order = orderRepository.findByIdAndUserEmail(orderId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        expirePendingVnPayOrderIfNeeded(order);
        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(String userEmail, UUID orderId) {
        Order order = orderRepository.findByIdAndUserEmail(orderId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        expirePendingVnPayOrderIfNeeded(order);

        if ("shipped".equals(order.getStatus()) || "delivered".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot cancel order that has been shipped or delivered");
        }

        if ("cancelled".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is already cancelled");
        }

        order.setStatus("cancelled");
        if ("vnpay".equals(order.getPaymentMethod()) && !"paid".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("failed");
        }
        if ("paid".equals(order.getPaymentStatus())) {
            log.info("Order {} cancelled after payment. Refund required.", orderId);
        }

        restoreStock(order);
        orderRepository.save(order);
        return toOrderResponse(order);
    }

    private Order findOrderByTxnRef(String txnRef) {
        if (txnRef == null || txnRef.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing order reference");
        }
        return orderRepository.findByVnpayTxnRef(txnRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private void expirePendingVnPayOrders(List<Order> orders) {
        for (Order order : orders) {
            expirePendingVnPayOrderIfNeeded(order);
        }
    }

    private void expirePendingVnPayOrderIfNeeded(Order order) {
        if (!isPendingVnPayOrder(order) || !isVnPayPaymentExpired(order)) {
            return;
        }

        order.setStatus("cancelled");
        order.setPaymentStatus("failed");
        restoreStock(order);
        orderRepository.save(order);
        log.info("Expired unpaid VNPay order {}", order.getId());
    }

    private boolean isPendingVnPayOrder(Order order) {
        return "vnpay".equals(order.getPaymentMethod())
                && "pending".equals(order.getStatus())
                && "pending".equals(order.getPaymentStatus());
    }

    private boolean isVnPayPaymentExpired(Order order) {
        if (order.getCreatedAt() == null) {
            return false;
        }

        Instant expiresAt = order.getCreatedAt().plusSeconds(vnPayConfig.getExpireMinutes() * 60L);
        return !Instant.now().isBefore(expiresAt);
    }

    private boolean isVnPayOrderFinalized(Order order) {
        return !"pending".equals(order.getStatus()) || !"pending".equals(order.getPaymentStatus());
    }

    private void applyVnPayResult(Order order, Map<String, String> params) {
        String vnpTransactionNo = params.get("vnp_TransactionNo");
        order.setVnpayTransactionId(vnpTransactionNo);

        if (vnPayService.isPaymentSuccess(params)) {
            order.setPaymentStatus("paid");
            order.setStatus("confirmed");

            try {
                String ghnOrderCode = ghnService.createShippingOrder(order);
                if (ghnOrderCode != null) {
                    order.setGhnOrderCode(ghnOrderCode);
                }
            } catch (Exception e) {
                log.warn("Could not create GHN order after payment for {}: {}", order.getId(), e.getMessage());
            }
        } else {
            order.setPaymentStatus("failed");
            order.setStatus("cancelled");
            restoreStock(order);
        }
    }

    private void restoreStock(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) return;
        Map<UUID, Integer> stockUpdates = new HashMap<>();
        for (OrderItem item : order.getItems()) {
            stockUpdates.put(item.getProductId(), item.getQuantity());
        }
        catalogClient.restoreStock(stockUpdates);
    }

    private Map<String, String> ipnResponse(String rspCode, String message) {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("RspCode", rspCode);
        response.put("Message", message);
        return response;
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toOrderItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingFee(order.getShippingFee())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .vnpayTransactionId(order.getVnpayTransactionId())
                .ghnOrderCode(order.getGhnOrderCode())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productThumbnail(item.getProductThumbnail())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
