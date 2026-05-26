package com.project.tshop.auth.service;

import com.project.tshop.auth.dto.profile.ProfileResponse;
import com.project.tshop.auth.dto.profile.ProfileUpdateRequest;
import com.project.tshop.auth.entity.User;
import com.project.tshop.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileResponse getCurrentProfile(String email) {
        User user = findUserByEmail(email);
        return toResponse(user);
    }

    @Transactional
    public ProfileResponse updateCurrentProfile(String email, ProfileUpdateRequest request) {
        User user = findUserByEmail(email);
        boolean changed = false;

        NameParts currentNameParts = splitFullName(user.getFullName());
        String firstName = currentNameParts.firstName();
        String lastName = currentNameParts.lastName();
        boolean hasNameUpdate = request.getFirstName() != null || request.getLastName() != null;

        if (request.getFirstName() != null) {
            firstName = normalizeRequiredNamePart(request.getFirstName(), "First name");
        }
        if (request.getLastName() != null) {
            lastName = normalizeOptionalNamePart(request.getLastName());
        }
        if (hasNameUpdate) {
            String fullName = joinFullName(firstName, lastName);
            if (fullName.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name must not be empty");
            }
            String currentFullName = normalizeWhitespace(user.getFullName());
            if (!Objects.equals(currentFullName, fullName)) {
                user.setFullName(fullName);
                changed = true;
            }
        }

        if (request.getPhone() != null) {
            String normalizedPhone = normalizeOptionalText(request.getPhone());
            if (!Objects.equals(normalizeOptionalText(user.getPhone()), normalizedPhone)) {
                user.setPhone(normalizedPhone);
                changed = true;
            }
        }

        if (request.getEmail() != null) {
            String normalizedEmail = normalizeEmail(request.getEmail());
            if (normalizedEmail.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email must not be blank");
            }
            String currentEmail = normalizeEmail(user.getEmail());
            if (!normalizedEmail.equals(currentEmail) && userRepository.existsByEmail(normalizedEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            if (!normalizedEmail.equals(currentEmail)) {
                user.setEmail(normalizedEmail);
                changed = true;
            }
        }

        if (request.getAddress() != null) {
            String normalizedAddress = normalizeOptionalText(request.getAddress());
            if (!Objects.equals(normalizeOptionalText(user.getAddress()), normalizedAddress)) {
                user.setAddress(normalizedAddress);
                changed = true;
            }
        }

        String requestedProvinceName = request.getProvinceName() != null ? request.getProvinceName() : request.getCity();
        if (request.getProvinceName() != null || request.getCity() != null) {
            String normalizedProvinceName = normalizeOptionalText(requestedProvinceName);
            if (!Objects.equals(normalizeOptionalText(firstNonBlank(user.getProvinceName(), user.getCity())), normalizedProvinceName)) {
                user.setProvinceName(normalizedProvinceName);
                user.setCity(normalizedProvinceName);
                changed = true;
            }
        }

        if (request.getProvinceId() != null && !Objects.equals(user.getProvinceId(), request.getProvinceId())) {
            user.setProvinceId(request.getProvinceId());
            changed = true;
        }

        String requestedDistrictName = request.getDistrictName() != null ? request.getDistrictName() : request.getState();
        if (request.getDistrictName() != null || request.getState() != null) {
            String normalizedDistrictName = normalizeOptionalText(requestedDistrictName);
            if (!Objects.equals(normalizeOptionalText(firstNonBlank(user.getDistrictName(), user.getState())), normalizedDistrictName)) {
                user.setDistrictName(normalizedDistrictName);
                user.setState(normalizedDistrictName);
                changed = true;
            }
        }

        if (request.getDistrictId() != null && !Objects.equals(user.getDistrictId(), request.getDistrictId())) {
            user.setDistrictId(request.getDistrictId());
            changed = true;
        }

        if (request.getWardCode() != null) {
            String normalizedWardCode = normalizeOptionalText(request.getWardCode());
            if (!Objects.equals(normalizeOptionalText(user.getWardCode()), normalizedWardCode)) {
                user.setWardCode(normalizedWardCode);
                changed = true;
            }
        }

        if (request.getWardName() != null) {
            String normalizedWardName = normalizeOptionalText(request.getWardName());
            if (!Objects.equals(normalizeOptionalText(user.getWardName()), normalizedWardName)) {
                user.setWardName(normalizedWardName);
                changed = true;
            }
        }

        if (changed) {
            userRepository.save(user);
        }
        return toResponse(user);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private ProfileResponse toResponse(User user) {
        NameParts nameParts = splitFullName(user.getFullName());
        String provinceName = firstNonBlank(user.getProvinceName(), user.getCity());
        String districtName = firstNonBlank(user.getDistrictName(), user.getState());

        return ProfileResponse.builder()
                .firstName(nameParts.firstName())
                .lastName(nameParts.lastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(provinceName)
                .state(districtName)
                .provinceId(user.getProvinceId())
                .provinceName(provinceName)
                .districtId(user.getDistrictId())
                .districtName(districtName)
                .wardCode(user.getWardCode())
                .wardName(user.getWardName())
                .memberSince(user.getCreatedAt())
                .totalOrders(0L)         // auth-service không có cross-DB call, trả 0
                .totalSpent(BigDecimal.ZERO)
                .build();
    }

    private String normalizeRequiredNamePart(String value, String fieldName) {
        String normalized = normalizeWhitespace(value);
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must not be blank");
        }
        return normalized;
    }

    private String normalizeOptionalNamePart(String value) {
        return normalizeWhitespace(value);
    }

    private String normalizeOptionalText(String value) {
        String normalized = normalizeWhitespace(value);
        return normalized.isBlank() ? null : normalized;
    }

    private String normalizeWhitespace(String value) {
        if (value == null) return "";
        return value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String value) {
        return normalizeWhitespace(value).toLowerCase(Locale.ROOT);
    }

    private String firstNonBlank(String primary, String fallback) {
        String normalizedPrimary = normalizeOptionalText(primary);
        if (normalizedPrimary != null) return normalizedPrimary;
        return normalizeOptionalText(fallback);
    }

    private NameParts splitFullName(String fullName) {
        String normalized = normalizeWhitespace(fullName);
        if (normalized.isBlank()) return new NameParts("", "");
        String[] parts = normalized.split(" ", 2);
        return new NameParts(parts[0], parts.length > 1 ? parts[1] : "");
    }

    private String joinFullName(String firstName, String lastName) {
        String first = normalizeWhitespace(firstName);
        String last = normalizeWhitespace(lastName);
        if (first.isBlank()) return "";
        if (last.isBlank()) return first;
        return first + " " + last;
    }

    private record NameParts(String firstName, String lastName) {}
}
