package com.project.tshop.service;

import com.project.tshop.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.SetBucketPolicyArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class MinioStorageService {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;
    private volatile boolean bucketInitialized = false;

    private void ensureBucketExists() {
        if (bucketInitialized) {
            return;
        }

        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioProperties.getBucket()).build()
            );
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(minioProperties.getBucket()).build()
                );
            }

            ensurePublicReadPolicy();
            bucketInitialized = true;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to initialize storage bucket",
                    exception
            );
        }
    }

    private void ensurePublicReadPolicy() throws Exception {
        String bucket = minioProperties.getBucket();
        String policy = """
                {
                  "Version":"2012-10-17",
                  "Statement":[
                    {
                      "Effect":"Allow",
                      "Principal":{"AWS":["*"]},
                      "Action":["s3:GetBucketLocation","s3:ListBucket"],
                      "Resource":["arn:aws:s3:::%s"]
                    },
                    {
                      "Effect":"Allow",
                      "Principal":{"AWS":["*"]},
                      "Action":["s3:GetObject"],
                      "Resource":["arn:aws:s3:::%s/*"]
                    }
                  ]
                }
                """.formatted(bucket, bucket);

        minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder()
                        .bucket(bucket)
                        .config(policy)
                        .build()
        );
    }

    public String uploadImage(MultipartFile file, String objectKey) {
        try (InputStream inputStream = file.getInputStream()) {
            ensureBucketExists();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperties.getBucket())
                            .object(objectKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return objectKey;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload image to storage",
                    exception
            );
        }
    }

    public void deleteObject(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioProperties.getBucket())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception ignored) {
            // Best-effort cleanup.
        }
    }

    public String toPublicUrl(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return "";
        }

        String normalized = objectKey.trim();
        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            return normalized;
        }
        normalized = normalized.replace('\\', '/').replaceAll("^/+", "");

        String bucket = minioProperties.getBucket();
        if (normalized.startsWith(bucket + "/")) {
            normalized = normalized.substring(bucket.length() + 1);
        }

        String base = minioProperties.getPublicBaseUrl();
        if (base == null || base.isBlank()) {
            base = minioProperties.getEndpoint();
        }

        String baseUrl = base.replaceAll("/+$", "");
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl)
                .pathSegment(bucket);

        for (String segment : normalized.split("/")) {
            String trimmed = segment.trim();
            if (!trimmed.isEmpty()) {
                builder.pathSegment(trimmed);
            }
        }

        return builder.build().toUriString();
    }
}
