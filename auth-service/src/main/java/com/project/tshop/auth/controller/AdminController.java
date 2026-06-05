package com.project.tshop.auth.controller;

import com.project.tshop.auth.dto.response.CustomerResponse;
import com.project.tshop.auth.entity.User;
import com.project.tshop.auth.repository.UserRepository;
import com.project.tshop.auth.service.OrderStatsClient;
import com.project.tshop.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final OrderStatsClient orderStatsClient;

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        List<User> customers = userRepository.findAll().stream()
                .filter(user -> "customer".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());

        List<CustomerResponse> responseList = customers.stream()
                .map(user -> {
                    OrderStatsClient.OrderStats stats = orderStatsClient.getOrderStats(user.getEmail());
                    return CustomerResponse.builder()
                            .id(user.getId())
                            .name(user.getFullName())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .totalOrders(stats.getTotalOrders())
                            .totalSpent(stats.getTotalSpent())
                            .joinDate(user.getCreatedAt())
                            .status("active")
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responseList, "Customers retrieved successfully"));
    }
}
