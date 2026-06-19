package com.project.tshop.order.dto.shipping;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShippingFeeRequest {

    @NotNull(message = "District ID is required")
    private Integer toDistrictId;

    @NotNull(message = "Ward code is required")
    private String toWardCode;

    private Integer weight = 500; // grams, default 500g

    private Integer insuranceValue = 0; // VND
}
