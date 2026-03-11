package com.project.tshop.dto.shipping;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShippingFeeResponse {

    private Integer total;
    private Integer serviceFee;
    private Integer insuranceFee;
}
