package com.project.tshop.catalog.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Configuration @EnableConfigurationProperties(MinioProperties.class) @RequiredArgsConstructor
public class MinioConfig {
    private final MinioProperties minioProperties;
    @Bean public MinioClient minioClient() {
        return MinioClient.builder().endpoint(minioProperties.getEndpoint())
            .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey()).build();
    }
}
