package com.project.tshop.service;

import com.project.tshop.dto.order.CheckoutRequest;
import com.project.tshop.dto.order.OrderItemResponse;
import com.project.tshop.dto.order.OrderResponse;
import com.project.tshop.dto.shipping.ShippingFeeRequest;
import com.project.tshop.dto.shipping.ShippingFeeResponse;
import com.project.tshop.entity.Cart;
import com.project.tshop.entity.CartItem;
import com.project.tshop.entity.Order;
import com.project.tshop.entity.OrderItem;
import com.project.tshop.entity.Product;
import com.project.tshop.entity.User;
import com.project.tshop.repository.OrderRepository;
import com.project.tshop.repository.ProductRepository;
import com.project.tshop.repository.UserRepository;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final VnPayService vnPayService;
    private final GhnService ghnService;

    @Transactional
    public OrderResponse checkout(String email, CheckoutRequest request, String ipAddress) {
        User user = findUser(email);
        Cart cart = cartService.getOrCreateCart(user);

        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        ShippingFeeRequest feeRequest = new ShippingFeeRequest();
        feeRequest.setToDistrictId(request.getDistrictId());
        feeRequest.setToWardCode(request.getWardCode());

        BigDecimal cartTotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            cartTotal = cartTotal.add(cartItem.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        feeRequest.setInsuranceValue(cartTotal.intValue());

        ShippingFeeResponse shippingFee;
        try {
            shippingFee = ghnService.calculateShippingFee(feeRequest);
        } catch (Exception e) {
            log.warn("Could not calculate shipping fee, using 0: {}", e.getMessage());
            shippingFee = ShippingFeeResponse.builder().total(0).build();
        }

        BigDecimal shippingFeeAmount = BigDecimal.valueOf(shippingFee.getTotal())
                .divide(new BigDecimal("25000"), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal totalAmount = cartTotal.add(shippingFeeAmount);

        Order order = Order.builder()
                .user(user)
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

        orderRepository.save(order);
        if ("vnpay".equals(request.getPaymentMethod())) {
            order.setVnpayTxnRef(vnPayService.buildTxnRef(order.getId()));
        }

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStockQuantity() != null && cartItem.getQuantity() > product.getStockQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for product: " + product.getName()
                                + ". Available: " + product.getStockQuantity());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productThumbnail(product.getThumbnail())
                    .unitPrice(product.getPrice())
                    .quantity(cartItem.getQuantity())
                    .totalPrice(itemTotal)
                    .build();

            order.getItems().add(orderItem);

            if (product.getStockQuantity() != null) {
                product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
                productRepository.save(product);
            }
        }

        orderRepository.save(order);
        cart.getItems().clear();

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

        if (order.getVnpayTransactionId() != null && !order.getVnpayTransactionId().isBlank()) {
            return ipnResponse("02", "Order already confirmed");
        }

        applyVnPayResult(order, params);
        orderRepository.save(order);
        return ipnResponse("00", "Confirm Success");
    }

    public Page<OrderResponse> getOrders(String email, int page, int size) {
        User user = findUser(email);
        Pageable pageable = PageRequest.of(page, Math.min(size, 20));
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::toOrderResponse);
    }

    public OrderResponse getOrderDetail(String email, UUID orderId) {
        User user = findUser(email);
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(String email, UUID orderId) {
        User user = findUser(email);
        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if ("shipped".equals(order.getStatus()) || "delivered".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot cancel order that has been shipped or delivered");
        }

        if ("cancelled".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is already cancelled");
        }

        order.setStatus("cancelled");
        if ("paid".equals(order.getPaymentStatus())) {
            log.info("Order {} cancelled after payment. Refund required.", orderId);
        }

        restoreStock(order);
        orderRepository.save(order);
        return toOrderResponse(order);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Order findOrderByTxnRef(String txnRef) {
        if (txnRef == null || txnRef.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing order reference");
        }
        return orderRepository.findByVnpayTxnRef(txnRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
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
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null && item.getProduct().getStockQuantity() != null) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
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
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productThumbnail(item.getProductThumbnail())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
