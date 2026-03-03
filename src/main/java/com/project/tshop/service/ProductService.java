package com.project.tshop.service;

import com.project.tshop.dto.product.ProductDetailResponse;
import com.project.tshop.dto.product.ProductImageResponse;
import com.project.tshop.dto.product.ProductListItemResponse;
import com.project.tshop.repository.ProductImageRepository;
import com.project.tshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_PAGE_SIZE = 24;
    private static final int MAX_PAGE_SIZE = 100;

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public Page<ProductListItemResponse> list(String search, String category, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size));
        String keyword = normalizeKeyword(search);
        String categorySlug = normalizeKeyword(category);
        return productRepository.search(keyword, categorySlug, pageable);
    }

    public ProductDetailResponse getById(UUID id) {
        ProductDetailResponse detail = productRepository.findDetailById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        List<ProductImageResponse> images = productImageRepository.findResponsesByProductId(id);
        if (images.isEmpty() && detail.getThumbnail() != null && !detail.getThumbnail().isBlank()) {
            images = List.of(new ProductImageResponse(detail.getThumbnail(), detail.getName() + " image", 1));
        }
        detail.setImages(images);
        return detail;
    }

    private int normalizePage(Integer page) {
        if (page == null) {
            return DEFAULT_PAGE;
        }
        return Math.max(0, page);
    }

    private int normalizeSize(Integer size) {
        if (size == null || size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(MAX_PAGE_SIZE, size);
    }

    private String normalizeKeyword(String rawValue) {
        if (rawValue == null) {
            return null;
        }
        String value = rawValue.trim();
        return value.isEmpty() ? null : value;
    }
}
