package com.project.tshop.auth.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CustomerResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private long totalOrders;
    private BigDecimal totalSpent;
    private Instant joinDate;
    private String status;
}
