package com.project.tshop.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ghn")
@Getter
@Setter
public class GhnConfig {

    private String token;
    private Integer shopId;
    private String apiUrl = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2";

    // Default shop address (from district/ward) for shipping fee calculation
    private Integer fromDistrictId = 1542; // default: Quan 1, HCM
}
