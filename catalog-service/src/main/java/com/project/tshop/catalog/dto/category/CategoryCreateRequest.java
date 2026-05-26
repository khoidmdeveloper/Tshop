package com.project.tshop.catalog.dto.category;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.UUID;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class CategoryCreateRequest { @NotBlank(message="Name is required") private String name; private String slug; private UUID parentId; }
