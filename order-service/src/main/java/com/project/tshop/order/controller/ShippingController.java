package com.project.tshop.order.controller;

import com.project.tshop.common.dto.ApiResponse;
import com.project.tshop.order.dto.shipping.ShippingFeeRequest;
import com.project.tshop.order.dto.shipping.ShippingFeeResponse;
import com.project.tshop.order.service.GhnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final GhnService ghnService;

    @PostMapping("/fee")
    public ResponseEntity<ApiResponse<ShippingFeeResponse>> calculateFee(
            @Valid @RequestBody ShippingFeeRequest request) {
        ShippingFeeResponse fee = ghnService.calculateShippingFee(request);
        return ResponseEntity.ok(ApiResponse.success(fee, "Shipping fee calculated"));
    }

    @GetMapping("/provinces")
    public ResponseEntity<ApiResponse<Object>> getProvinces() {
        Object provinces = ghnService.getProvinces();
        return ResponseEntity.ok(ApiResponse.success(provinces, "Provinces retrieved"));
    }

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<Object>> getDistricts(@RequestParam int provinceId) {
        Object districts = ghnService.getDistricts(provinceId);
        return ResponseEntity.ok(ApiResponse.success(districts, "Districts retrieved"));
    }

    @GetMapping("/wards")
    public ResponseEntity<ApiResponse<Object>> getWards(@RequestParam int districtId) {
        Object wards = ghnService.getWards(districtId);
        return ResponseEntity.ok(ApiResponse.success(wards, "Wards retrieved"));
    }
}
