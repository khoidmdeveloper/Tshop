package com.project.tshop.service;

import com.project.tshop.dto.category.CategoryCreateRequest;
import com.project.tshop.dto.category.CategoryResponse;
import com.project.tshop.dto.category.CategoryUpdateRequest;
import com.project.tshop.entity.Category;
import com.project.tshop.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final int MAX_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_PAGE_SIZE = 10;

    private final CategoryRepository categoryRepository;

    public CategoryResponse create(CategoryCreateRequest request) {
        String name = request.getName().trim();
        String slug = resolveSlug(request.getSlug(), name, null);
        Category parent = resolveParent(request.getParentId(), null);

        Category category = new Category(
                null,
                name,
                slug,
                parent,
                new java.util.ArrayList<>(),
                new java.util.ArrayList<>()
        );

        categoryRepository.save(category);
        return categoryRepository.findResponseBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to load created category"
                ));
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryUpdateRequest request) {
        CategoryResponse existing = getResponse(id);

        NameResolution nameResolution = resolveUpdateName(existing, request);
        String slug = resolveUpdateSlug(request, nameResolution.name(), nameResolution.changed(), id);
        UUID parentId = resolveParentId(existing, request);
        Category parent = resolveParent(parentId, id);

        categoryRepository.updateCategory(id, nameResolution.name(), slug, parent);
        return getResponse(id);
    }

    public void delete(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
        categoryRepository.deleteById(id);
    }

    public CategoryResponse getById(UUID id) {
        return getResponse(id);
    }

    public Page<CategoryResponse> list(String search, Integer page, Integer size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                normalizePage(page),
                normalizeSize(size)
        );

        String keyword = (search == null || search.isBlank()) ? null : search.trim();
        return categoryRepository.search(keyword, pageable);
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
        return Math.min(size, MAX_PAGE_SIZE);
    }

    private NameResolution resolveUpdateName(CategoryResponse existing, CategoryUpdateRequest request) {
        String requested = request.getName();
        if (requested == null || requested.isBlank()) {
            return new NameResolution(existing.getName(), false);
        }
        return new NameResolution(requested.trim(), true);
    }

    private String resolveUpdateSlug(CategoryUpdateRequest request, String name, boolean nameChanged, UUID currentId) {
        String requested = request.getSlug();
        if (requested != null && requested.isBlank()) {
            return null;
        }
        if (nameChanged) {
            return resolveSlug(null, name, currentId);
        }
        return resolveSlug(requested, name, currentId);
    }

    private UUID resolveParentId(CategoryResponse existing, CategoryUpdateRequest request) {
        UUID requested = request.getParentId();
        return requested != null ? requested : existing.getParentId();
    }

    private CategoryResponse getResponse(UUID id) {
        return categoryRepository.findResponseById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private Category resolveParent(UUID parentId, UUID currentId) {
        if (parentId == null) {
            return null;
        }
        if (parentId.equals(currentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent category cannot be itself");
        }
        if (!categoryRepository.existsById(parentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent category not found");
        }
        return categoryRepository.getReferenceById(parentId);
    }

    private String resolveSlug(String requestedSlug, String fallbackName, UUID currentId) {
        String base = requestedSlug;
        if (base == null || base.isBlank()) {
            base = fallbackName;
        }
        if (base == null || base.isBlank()) {
            return null;
        }
        String slug = toSlug(base);
        if (slug.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug is invalid");
        }
        ensureSlugUnique(slug, currentId);
        return slug;
    }

    private void ensureSlugUnique(String slug, UUID currentId) {
        if (categoryRepository.existsBySlug(slug)) {
            if (currentId == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
            }
            CategoryResponse existing = categoryRepository.findResponseBySlug(slug)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists"));
            if (!existing.getId().equals(currentId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
            }
        }
    }

    private String toSlug(String input) {
        String slug = input.trim().toLowerCase(Locale.ROOT);
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("-{2,}", "-");
        slug = slug.replaceAll("^-|-$", "");
        return slug;
    }

    private record NameResolution(String name, boolean changed) {
    }
}
