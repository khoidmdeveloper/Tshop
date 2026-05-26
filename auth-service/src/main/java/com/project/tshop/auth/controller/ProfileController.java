package com.project.tshop.auth.controller;

import com.project.tshop.auth.dto.profile.ProfileResponse;
import com.project.tshop.auth.dto.profile.ProfileUpdateRequest;
import com.project.tshop.auth.dto.response.ApiResponse;
import com.project.tshop.auth.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        ProfileResponse response = profileService.getCurrentProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequest request) {
        ProfileResponse response = profileService.updateCurrentProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully"));
    }
}
