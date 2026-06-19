package com.project.tshop.order.repository;
import com.project.tshop.order.entity.Cart;
import com.project.tshop.order.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; import java.util.UUID;
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByCartAndProductId(Cart cart, UUID productId);
}
