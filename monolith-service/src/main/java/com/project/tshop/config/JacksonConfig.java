package com.project.tshop.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides a Jackson 2.x ObjectMapper bean.
 * Spring Boot 4.x auto-configures Jackson 3.x (tools.jackson) only.
 * Security classes (RestAuthenticationEntryPoint, RestAccessDeniedHandler)
 * and DTOs use Jackson 2.x (com.fasterxml.jackson), so we must define
 * this bean explicitly.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
