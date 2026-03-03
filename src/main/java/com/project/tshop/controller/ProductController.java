package com.project.tshop.controller;

import com.project.tshop.dto.product.ProductDetailResponse;
import com.project.tshop.dto.product.ProductCreateRequest;
import com.project.tshop.dto.product.ProductListItemResponse;
import com.project.tshop.dto.response.ApiResponse;
import com.project.tshop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductListItemResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "24") Integer size
    ) {
        Page<ProductListItemResponse> response = productService.list(search, category, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Product list"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getById(@PathVariable UUID id) {
        ProductDetailResponse response = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Product detail"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> create(
            @Valid @RequestPart("payload") ProductCreateRequest request,
            @RequestPart("thumbnail") MultipartFile thumbnail,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        ProductDetailResponse response = productService.create(request, thumbnail, images);
        return ResponseEntity.ok(ApiResponse.success(response, "Product created"));
    }
}
