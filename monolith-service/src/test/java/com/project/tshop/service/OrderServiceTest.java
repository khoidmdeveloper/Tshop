package com.project.tshop.service;

import com.project.tshop.config.VnPayConfig;
import com.project.tshop.dto.order.OrderResponse;
import com.project.tshop.entity.Order;
import com.project.tshop.entity.OrderItem;
import com.project.tshop.entity.Product;
import com.project.tshop.entity.User;
import com.project.tshop.repository.OrderRepository;
import com.project.tshop.repository.ProductRepository;
import com.project.tshop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartService cartService;

    @Mock
    private VnPayService vnPayService;

    @Mock
    private GhnService ghnService;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        VnPayConfig vnPayConfig = new VnPayConfig();
        vnPayConfig.setExpireMinutes(15);

        orderService = new OrderService(
                orderRepository,
                productRepository,
                userRepository,
                cartService,
                vnPayService,
                ghnService,
                vnPayConfig
        );
    }

    @Test
    void getOrdersExpiresStalePendingVnPayOrders() {
        User user = createUser();
        Order order = createPendingVnPayOrder(user, Instant.now().minusSeconds(20 * 60L), 2);
        Page<Order> page = new PageImpl<>(List.of(order), PageRequest.of(0, 10), 1);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(orderRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 10))).thenReturn(page);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Page<OrderResponse> result = orderService.getOrders(user.getEmail(), 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("cancelled", result.getContent().get(0).getStatus());
        assertEquals("failed", result.getContent().get(0).getPaymentStatus());
        assertEquals(7, order.getItems().get(0).getProduct().getStockQuantity());
        verify(orderRepository).save(order);
        verify(productRepository).save(order.getItems().get(0).getProduct());
    }

    @Test
    void getOrdersKeepsRecentPendingVnPayOrdersPending() {
        User user = createUser();
        Order order = createPendingVnPayOrder(user, Instant.now().minusSeconds(5 * 60L), 1);
        Page<Order> page = new PageImpl<>(List.of(order), PageRequest.of(0, 10), 1);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(orderRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 10))).thenReturn(page);

        Page<OrderResponse> result = orderService.getOrders(user.getEmail(), 0, 10);

        assertEquals("pending", result.getContent().get(0).getStatus());
        assertEquals("pending", result.getContent().get(0).getPaymentStatus());
        verify(orderRepository, never()).save(any(Order.class));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void cancelOrderMarksUnpaidVnPayOrderAsFailed() {
        User user = createUser();
        Order order = createPendingVnPayOrder(user, Instant.now().minusSeconds(60), 1);
        UUID orderId = order.getId();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(orderRepository.findByIdAndUser(orderId, user)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.cancelOrder(user.getEmail(), orderId);

        assertNotNull(response);
        assertEquals("cancelled", response.getStatus());
        assertEquals("failed", response.getPaymentStatus());
        assertTrue(order.getItems().get(0).getProduct().getStockQuantity() > 5);
        verify(orderRepository).save(order);
    }

    private User createUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("customer@test.local")
                .role("customer")
                .build();
    }

    private Order createPendingVnPayOrder(User user, Instant createdAt, int quantity) {
        Product product = Product.builder()
                .id(UUID.randomUUID())
                .name("Test Product")
                .price(new BigDecimal("100.00"))
                .status("active")
                .stockQuantity(5)
                .build();

        Order order = Order.builder()
                .id(UUID.randomUUID())
                .user(user)
                .status("pending")
                .paymentMethod("vnpay")
                .paymentStatus("pending")
                .totalAmount(new BigDecimal("100.00"))
                .shippingFee(new BigDecimal("0.00"))
                .receiverName("Test User")
                .receiverPhone("0900000000")
                .shippingAddress("123 Test Street")
                .createdAt(createdAt)
                .build();

        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .product(product)
                .productName(product.getName())
                .unitPrice(product.getPrice())
                .quantity(quantity)
                .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)))
                .build();

        order.getItems().add(item);
        return order;
    }
}
