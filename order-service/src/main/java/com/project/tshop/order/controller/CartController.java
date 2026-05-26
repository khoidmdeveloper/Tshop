package com.project.tshop.order.controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.project.tshop.order.dto.cart.AddToCartRequest;
import com.project.tshop.order.dto.cart.CartResponse;
import com.project.tshop.order.dto.cart.UpdateCartItemRequest;
import com.project.tshop.order.dto.response.ApiResponse;
import com.project.tshop.order.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(principal.getName())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            Principal principal,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(ApiResponse.success(cartService.addItem(principal.getName(), request), "Item added to cart"));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            Principal principal,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success(cartService.updateItem(principal.getName(), itemId, request), "Cart updated"));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            Principal principal,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success(cartService.removeItem(principal.getName(), itemId), "Item removed"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared"));
    }
}
