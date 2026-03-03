package com.project.tshop.service;

import com.project.tshop.dto.product.ProductCreateRequest;
import com.project.tshop.dto.product.ProductDetailResponse;
import com.project.tshop.dto.product.ProductImageResponse;
import com.project.tshop.dto.product.ProductListItemResponse;
import com.project.tshop.entity.Category;
import com.project.tshop.entity.Product;
import com.project.tshop.entity.ProductImage;
import com.project.tshop.repository.CategoryRepository;
import com.project.tshop.repository.ProductImageRepository;
import com.project.tshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_PAGE_SIZE = 24;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_GALLERY_IMAGES = 10;

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final MinioStorageService minioStorageService;

    public Page<ProductListItemResponse> list(String search, String category, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(normalizePage(page), normalizeSize(size));
        String keyword = normalizeKeyword(search);
        String categorySlug = normalizeKeyword(category);
        return productRepository.search(keyword, categorySlug, pageable)
                .map(this::resolveListThumbnail);
    }

    public ProductDetailResponse getById(UUID id) {
        ProductDetailResponse detail = productRepository.findDetailById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        detail.setThumbnail(minioStorageService.toPublicUrl(detail.getThumbnail()));

        List<ProductImageResponse> images = productImageRepository.findResponsesByProductId(id).stream()
                .map(this::resolveImageUrl)
                .toList();
        if (images.isEmpty() && detail.getThumbnail() != null && !detail.getThumbnail().isBlank()) {
            images = List.of(new ProductImageResponse(detail.getThumbnail(), detail.getName() + " image", 1));
        }
        detail.setImages(images);
        return detail;
    }

    @Transactional
    public ProductDetailResponse create(
            ProductCreateRequest request,
            MultipartFile thumbnail,
            List<MultipartFile> images
    ) {
        validateRequiredImage(thumbnail, "thumbnail");

        List<MultipartFile> galleryImages = normalizeGalleryImages(images);
        if (galleryImages.size() > MAX_GALLERY_IMAGES) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A product supports up to " + MAX_GALLERY_IMAGES + " gallery images"
            );
        }

        String name = request.getName().trim();
        String slug = resolveCreateSlug(request.getSlug(), name);
        String status = resolveStatus(request.getStatus());
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        List<String> uploadedKeys = new ArrayList<>();
        try {
            String thumbnailPath = uploadAndTrack(thumbnail, slug, "thumb", uploadedKeys);

            Product product = new Product(
                    null,
                    category,
                    name,
                    slug,
                    request.getPrice(),
                    request.getStockQuantity(),
                    normalizeOptionalText(request.getDescription()),
                    null,
                    thumbnailPath,
                    status,
                    null,
                    new ArrayList<>(),
                    new ArrayList<>(),
                    new ArrayList<>(),
                    new ArrayList<>()
            );

            Product savedProduct = productRepository.save(product);
            List<ProductImage> productImages = new ArrayList<>();

            productImages.add(new ProductImage(
                    null,
                    savedProduct,
                    thumbnailPath,
                    name + " thumbnail",
                    1,
                    null
            ));

            int sortOrder = 2;
            for (MultipartFile galleryImage : galleryImages) {
                String imagePath = uploadAndTrack(galleryImage, slug, "gallery-" + sortOrder, uploadedKeys);
                productImages.add(new ProductImage(
                        null,
                        savedProduct,
                        imagePath,
                        name + " image " + sortOrder,
                        sortOrder,
                        null
                ));
                sortOrder++;
            }

            productImageRepository.saveAll(productImages);
            ProductDetailResponse detail = productRepository.findDetailBySlug(slug)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to load created product"
                    ));

            detail.setThumbnail(minioStorageService.toPublicUrl(detail.getThumbnail()));
            List<ProductImageResponse> imageResponses = productImageRepository.findResponsesByProductId(detail.getId()).stream()
                    .map(this::resolveImageUrl)
                    .toList();
            detail.setImages(imageResponses);
            return detail;
        } catch (Exception exception) {
            uploadedKeys.forEach(minioStorageService::deleteObject);
            if (exception instanceof ResponseStatusException responseStatusException) {
                throw responseStatusException;
            }
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to create product",
                    exception
            );
        }
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

    private ProductListItemResponse resolveListThumbnail(ProductListItemResponse response) {
        response.setThumbnail(minioStorageService.toPublicUrl(response.getThumbnail()));
        return response;
    }

    private ProductImageResponse resolveImageUrl(ProductImageResponse response) {
        return new ProductImageResponse(
                minioStorageService.toPublicUrl(response.getUrl()),
                response.getAltText(),
                response.getSortOrder()
        );
    }

    private List<MultipartFile> normalizeGalleryImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }

        List<MultipartFile> validImages = new ArrayList<>();
        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }
            validateRequiredImage(image, "images");
            validImages.add(image);
        }
        return validImages;
    }

    private void validateRequiredImage(MultipartFile file, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be an image file");
        }

        try (InputStream inputStream = file.getInputStream()) {
            if (ImageIO.read(inputStream) == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be a valid image");
            }
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be a valid image", exception);
        }
    }

    private String resolveCreateSlug(String requestedSlug, String name) {
        String base = normalizeKeyword(requestedSlug);
        if (base == null) {
            base = name;
        }

        String slug = toSlug(base);
        if (slug.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug is invalid");
        }
        if (productRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product slug already exists");
        }
        return slug;
    }

    private String resolveStatus(String requestedStatus) {
        if (requestedStatus == null || requestedStatus.isBlank()) {
            return "active";
        }

        String normalized = requestedStatus.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "active", "draft", "archived" -> normalized;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product status");
        };
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String uploadAndTrack(
            MultipartFile file,
            String slug,
            String keyHint,
            List<String> uploadedKeys
    ) {
        String extension = resolveFileExtension(file);
        String objectKey = "products/" + slug + "/" + UUID.randomUUID() + "-" + keyHint + extension;
        String savedKey = minioStorageService.uploadImage(file, objectKey);
        uploadedKeys.add(savedKey);
        return minioStorageService.toPublicUrl(savedKey);
    }

    private String resolveFileExtension(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return ".jpg";
        }

        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    private String toSlug(String input) {
        String slug = input.trim().toLowerCase(Locale.ROOT);
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("-{2,}", "-");
        slug = slug.replaceAll("^-|-$", "");
        return slug;
    }
}
