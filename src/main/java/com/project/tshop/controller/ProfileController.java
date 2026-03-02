package com.project.tshop.controller;

import com.project.tshop.dto.profile.ProfileResponse;
import com.project.tshop.dto.profile.ProfileUpdateRequest;
import com.project.tshop.dto.response.ApiResponse;
import com.project.tshop.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication authentication) {
        ProfileResponse response = profileService.getCurrentProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Profile loaded"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        ProfileResponse response = profileService.updateCurrentProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated"));
    }
}
