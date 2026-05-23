package com.project.tshop.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import com.project.tshop.validation.ValueValidation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "status", nullable = false)
    private String status; // pending, confirmed, shipped, delivered, cancelled

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "receiver_name")
    private String receiverName;

    @Column(name = "receiver_phone")
    private String receiverPhone;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "note", columnDefinition = "text")
    private String note;

    // --- Payment fields ---
    @Column(name = "payment_method")
    private String paymentMethod; // cod, vnpay

    @Column(name = "payment_status")
    private String paymentStatus; // pending, paid, failed

    @Column(name = "vnpay_transaction_id")
    private String vnpayTransactionId;

    @Column(name = "vnpay_txn_ref", length = 20)
    private String vnpayTxnRef;

    // --- Shipping fields ---
    @Column(name = "shipping_fee", precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "ghn_order_code")
    private String ghnOrderCode;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "ward_code")
    private String wardCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void validateStatus() {
        ValueValidation.requireOneOf(
                "orders.status",
                status,
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled");
    }
}
