package com.project.tshop.catalog.config;
import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

@Component @ConfigurationProperties(prefix = "minio")
@Getter @Setter
public class MinioProperties {
    private String endpoint; private String accessKey; private String secretKey; private String bucket; private String publicBaseUrl;
}
