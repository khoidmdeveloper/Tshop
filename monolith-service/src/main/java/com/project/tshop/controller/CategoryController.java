package com.project.tshop.controller;

import com.project.tshop.dto.category.CategoryCreateRequest;
import com.project.tshop.dto.category.CategoryResponse;
import com.project.tshop.dto.category.CategoryUpdateRequest;
import com.project.tshop.dto.response.ApiResponse;
import com.project.tshop.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        CategoryResponse response = categoryService.create(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Category created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable UUID id,
            @RequestBody CategoryUpdateRequest request
    ) {
        CategoryResponse response = categoryService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Category updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable UUID id) {
        CategoryResponse response = categoryService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Category detail"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size
    ) {
        Page<CategoryResponse> response = categoryService.list(search, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Category list"));
    }
}
