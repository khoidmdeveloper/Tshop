package com.project.tshop.order.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    private String receiverPhone;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotNull(message = "District ID is required")
    private Integer districtId;

    @NotBlank(message = "Ward code is required")
    private String wardCode;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "^(cod|vnpay)$", message = "Payment method must be 'cod' or 'vnpay'")
    private String paymentMethod;

    private String note;
}
