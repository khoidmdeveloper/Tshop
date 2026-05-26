package com.project.tshop.catalog.controller;
import com.project.tshop.catalog.dto.response.ApiResponse;
import com.project.tshop.catalog.dto.product.ProductCreateRequest;
import com.project.tshop.catalog.dto.product.ProductDetailResponse;
import com.project.tshop.catalog.dto.product.ProductListItemResponse;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestHeader;
import com.project.tshop.catalog.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Value("${internal.secret}")
    private String expectedInternalSecret;

    private void verifyInternalSecret(String secret) {
        if (!expectedInternalSecret.equals(secret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid internal secret");
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductListItemResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(ApiResponse.success(productService.list(search, category, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id)));
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> create(
            @Valid @RequestPart("payload") ProductCreateRequest request,
            @RequestPart("thumbnail") MultipartFile thumbnail,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponse.success(productService.create(request, thumbnail, images), "Product created"));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<ProductDetailResponse>>> getBatch(
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret,
            @RequestBody List<UUID> ids) {
        verifyInternalSecret(secret);
        return ResponseEntity.ok(ApiResponse.success(productService.batchGetDetails(ids)));
    }

    @PostMapping("/stock/deduct")
    public ResponseEntity<ApiResponse<Object>> deductStock(
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret,
            @RequestBody Map<UUID, Integer> updates) {
        verifyInternalSecret(secret);
        productService.deductStock(updates);
        return ResponseEntity.ok(ApiResponse.success(null, "Stock deducted"));
    }

    @PostMapping("/stock/restore")
    public ResponseEntity<ApiResponse<Object>> restoreStock(
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret,
            @RequestBody Map<UUID, Integer> updates) {
        verifyInternalSecret(secret);
        productService.restoreStock(updates);
        return ResponseEntity.ok(ApiResponse.success(null, "Stock restored"));
    }
}
