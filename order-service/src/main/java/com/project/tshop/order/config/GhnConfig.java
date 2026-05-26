package com.project.tshop.order.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ghn")
@Getter
@Setter
public class GhnConfig {
    private String apiUrl;
    private String token;
    private Integer shopId;
}
