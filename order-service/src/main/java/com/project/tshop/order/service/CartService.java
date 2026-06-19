package com.project.tshop.order.service;

import com.project.tshop.order.dto.cart.AddToCartRequest;
import com.project.tshop.order.dto.cart.CartItemResponse;
import com.project.tshop.order.dto.cart.CartResponse;
import com.project.tshop.order.dto.cart.UpdateCartItemRequest;
import com.project.tshop.order.entity.Cart;
import com.project.tshop.order.entity.CartItem;
import com.project.tshop.order.repository.CartItemRepository;
import com.project.tshop.order.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CatalogClient catalogClient;

    public CartResponse getCart(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String userEmail, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userEmail);

        CatalogClient.ProductDetail product = catalogClient.getProduct(request.getProductId());

        if (!"active".equals(product.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is not available");
        }

        var existingItem = cartItemRepository.findByCartAndProductId(cart, product.getId());
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (product.getStockQuantity() != null && newQty > product.getStockQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock. Available: " + product.getStockQuantity());
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            if (product.getStockQuantity() != null && request.getQuantity() > product.getStockQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock. Available: " + product.getStockQuantity());
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productId(product.getId())
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(String userEmail, UUID itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userEmail);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This item does not belong to your cart");
        }

        CatalogClient.ProductDetail product = catalogClient.getProduct(item.getProductId());
        
        if (product.getStockQuantity() != null && request.getQuantity() > product.getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Not enough stock. Available: " + product.getStockQuantity());
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(String userEmail, UUID itemId) {
        Cart cart = getOrCreateCart(userEmail);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toCartResponse(cart);
    }

    @Transactional
    public void clearCart(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // --- Helper methods ---

    public Cart getOrCreateCart(String userEmail) {
        return cartRepository.findByUserEmail(userEmail)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().userEmail(userEmail).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toCartItemResponse)
                .toList();

        BigDecimal totalPrice = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(items)
                .totalItems(items.size())
                .totalPrice(totalPrice)
                .build();
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        CatalogClient.ProductDetail product;
        try {
            product = catalogClient.getProduct(item.getProductId());
        } catch (Exception e) {
            // Product might have been deleted, returning dummy info
            product = new CatalogClient.ProductDetail();
            product.setId(item.getProductId());
            product.setName("Product unavailable");
            product.setPrice(BigDecimal.ZERO);
            product.setStockQuantity(0);
        }

        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productThumbnail(product.getThumbnail())
                .productPrice(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
