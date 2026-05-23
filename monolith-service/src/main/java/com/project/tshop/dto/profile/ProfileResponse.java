package com.project.tshop.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String address;

    private String city;

    private String state;

    private Integer provinceId;

    private String provinceName;

    private Integer districtId;

    private String districtName;

    private String wardCode;

    private String wardName;

    private Instant memberSince;

    private long totalOrders;

    private BigDecimal totalSpent;
}
