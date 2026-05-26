package com.project.tshop.order.repository;
import com.project.tshop.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; import java.util.UUID;
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);
    Optional<Order> findByIdAndUserEmail(UUID id, String userEmail);
    Optional<Order> findByVnpayTxnRef(String vnpayTxnRef);
}
