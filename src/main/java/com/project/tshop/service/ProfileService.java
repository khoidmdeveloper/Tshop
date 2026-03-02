package com.project.tshop.service;

import com.project.tshop.dto.profile.ProfileResponse;
import com.project.tshop.dto.profile.ProfileUpdateRequest;
import com.project.tshop.entity.User;
import com.project.tshop.repository.OrderRepository;
import com.project.tshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

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
            String normalized = normalizeRequiredNamePart(request.getFirstName(), "First name");
            firstName = normalized;
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

        if (request.getCity() != null) {
            String normalizedCity = normalizeOptionalText(request.getCity());
            if (!Objects.equals(normalizeOptionalText(user.getCity()), normalizedCity)) {
                user.setCity(normalizedCity);
                changed = true;
            }
        }

        if (request.getState() != null) {
            String normalizedState = normalizeOptionalText(request.getState());
            if (!Objects.equals(normalizeOptionalText(user.getState()), normalizedState)) {
                user.setState(normalizedState);
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
        long totalOrders = orderRepository.countByUser_Id(user.getId());
        BigDecimal totalSpent = orderRepository.sumTotalAmountByUserId(user.getId());

        return ProfileResponse.builder()
                .firstName(nameParts.firstName())
                .lastName(nameParts.lastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .memberSince(user.getCreatedAt())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent)
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
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String value) {
        return normalizeWhitespace(value).toLowerCase(Locale.ROOT);
    }

    private NameParts splitFullName(String fullName) {
        String normalized = normalizeWhitespace(fullName);
        if (normalized.isBlank()) {
            return new NameParts("", "");
        }

        String[] parts = normalized.split(" ", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";
        return new NameParts(firstName, lastName);
    }

    private String joinFullName(String firstName, String lastName) {
        String first = normalizeWhitespace(firstName);
        String last = normalizeWhitespace(lastName);

        if (first.isBlank()) {
            return "";
        }
        if (last.isBlank()) {
            return first;
        }
        return first + " " + last;
    }

    private record NameParts(String firstName, String lastName) {
    }
}
