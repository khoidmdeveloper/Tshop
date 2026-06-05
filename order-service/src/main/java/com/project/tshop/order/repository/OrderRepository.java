package com.project.tshop.order.repository;

import com.project.tshop.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);
    Optional<Order> findByIdAndUserEmail(UUID id, String userEmail);
    Optional<Order> findByVnpayTxnRef(String vnpayTxnRef);

    long countByUserEmail(String userEmail);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from Order o
            where o.userEmail = :userEmail
            """)
    BigDecimal sumTotalAmountByUserEmail(@Param("userEmail") String userEmail);
}
