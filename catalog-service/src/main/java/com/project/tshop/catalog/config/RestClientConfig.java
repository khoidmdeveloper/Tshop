package com.project.tshop.catalog.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

@Configuration public class RestClientConfig {
    @Bean public RestClient restClient() { return RestClient.builder().build(); }
}
