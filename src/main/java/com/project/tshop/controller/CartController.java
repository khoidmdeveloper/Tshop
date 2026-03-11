package com.project.tshop.controller;

import com.project.tshop.dto.cart.AddToCartRequest;
import com.project.tshop.dto.cart.CartResponse;
import com.project.tshop.dto.cart.UpdateCartItemRequest;
import com.project.tshop.dto.response.ApiResponse;
import com.project.tshop.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication auth) {
        CartResponse cart = cartService.getCart(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart retrieved"));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            Authentication auth,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addItem(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item added to cart"));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            Authentication auth,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateItem(auth.getName(), itemId, request);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart item updated"));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            Authentication auth,
            @PathVariable UUID itemId) {
        CartResponse cart = cartService.removeItem(auth.getName(), itemId);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item removed from cart"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication auth) {
        cartService.clearCart(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared"));
    }
}
