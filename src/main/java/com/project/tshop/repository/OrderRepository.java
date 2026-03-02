package com.project.tshop.repository;

import com.project.tshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
}
