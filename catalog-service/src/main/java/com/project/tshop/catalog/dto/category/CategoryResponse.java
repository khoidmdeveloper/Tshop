package com.project.tshop.catalog.dto.category;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class CategoryResponse { private UUID id; private String name; private String slug; private UUID parentId; }
