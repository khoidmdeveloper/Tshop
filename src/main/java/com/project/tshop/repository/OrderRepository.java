package com.project.tshop.repository;

import com.project.tshop.entity.Order;
import com.project.tshop.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    long countByUser_Id(UUID userId);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from Order o
            where o.user.id = :userId
            """)
    BigDecimal sumTotalAmountByUserId(@Param("userId") UUID userId);

    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Optional<Order> findByIdAndUser(UUID id, User user);

    Optional<Order> findByVnpayTxnRef(String vnpayTxnRef);
}
