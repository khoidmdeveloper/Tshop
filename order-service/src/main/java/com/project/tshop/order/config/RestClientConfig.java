package com.project.tshop.order.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;

@Configuration
public class RestClientConfig {
    
    @Bean
    @LoadBalanced
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
    
    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder.build();
    }
}
