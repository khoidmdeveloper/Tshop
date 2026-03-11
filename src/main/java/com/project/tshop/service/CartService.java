package com.project.tshop.service;

import com.project.tshop.dto.cart.AddToCartRequest;
import com.project.tshop.dto.cart.CartItemResponse;
import com.project.tshop.dto.cart.CartResponse;
import com.project.tshop.dto.cart.UpdateCartItemRequest;
import com.project.tshop.entity.Cart;
import com.project.tshop.entity.CartItem;
import com.project.tshop.entity.Product;
import com.project.tshop.entity.User;
import com.project.tshop.repository.CartItemRepository;
import com.project.tshop.repository.CartRepository;
import com.project.tshop.repository.ProductRepository;
import com.project.tshop.repository.UserRepository;
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
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartResponse getCart(String email) {
        User user = findUser(email);
        Cart cart = getOrCreateCart(user);
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, AddToCartRequest request) {
        User user = findUser(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!"active".equals(product.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is not available");
        }

        // Check if item already exists in cart
        var existingItem = cartItemRepository.findByCartAndProduct(cart, product);
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
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(String email, UUID itemId, UpdateCartItemRequest request) {
        User user = findUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This item does not belong to your cart");
        }

        Product product = item.getProduct();
        if (product.getStockQuantity() != null && request.getQuantity() > product.getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Not enough stock. Available: " + product.getStockQuantity());
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(String email, UUID itemId) {
        User user = findUser(email);
        Cart cart = getOrCreateCart(user);

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
    public void clearCart(String email) {
        User user = findUser(email);
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // --- Helper methods ---

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
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
        Product product = item.getProduct();
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
