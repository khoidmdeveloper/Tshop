package com.project.tshop.repository;

import com.project.tshop.entity.Cart;
import com.project.tshop.entity.CartItem;
import com.project.tshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    void deleteAllByCart(Cart cart);
}
