package com.project.tshop.auth.service;

import com.project.tshop.auth.dto.auth.AuthResponse;
import com.project.tshop.auth.dto.auth.RegisterRequest;
import com.project.tshop.auth.dto.auth.LoginRequest;
import com.project.tshop.auth.dto.auth.LogoutRequest;
import com.project.tshop.auth.dto.auth.RefreshTokenRequest;
import com.project.tshop.auth.entity.RevokedRefreshToken;
import com.project.tshop.auth.entity.User;
import com.project.tshop.auth.exception.UserNotFoundException;
import com.project.tshop.auth.exception.EmailAlreadyExistsException;
import com.project.tshop.auth.exception.RefreshTokenRevokedException;
import com.project.tshop.auth.exception.InvalidRefreshTokenException;
import com.project.tshop.auth.repository.RevokedRefreshTokenRepository;
import com.project.tshop.auth.repository.UserRepository;
import com.project.tshop.auth.security.JwtService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RevokedRefreshTokenRepository revokedRefreshTokenRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role("customer")
                .build();

        userRepository.save(user);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole());
        String accessToken = jwtService.generateAccessToken(extraClaims, user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole());
        String accessToken = jwtService.generateAccessToken(extraClaims, user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = normalizeToken(request.getRefreshToken());
        removeExpiredRevokedTokens();

        if (isRefreshTokenRevoked(refreshToken)) {
            throw new RefreshTokenRevokedException("Refresh token has been revoked");
        }

        String userEmail = extractTokenUsername(refreshToken);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole());
        String accessToken = jwtService.generateAccessToken(extraClaims, user);
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public void logout(LogoutRequest request) {
        String refreshToken = normalizeToken(request.getRefreshToken());
        removeExpiredRevokedTokens();

        if (isRefreshTokenRevoked(refreshToken)) {
            return;
        }

        String userEmail = extractTokenUsername(refreshToken);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }

        Date expiration = jwtService.extractClaim(refreshToken, claims -> claims.getExpiration());
        try {
            revokedRefreshTokenRepository.save(
                    RevokedRefreshToken.builder()
                            .tokenHash(hashToken(refreshToken))
                            .userEmail(userEmail)
                            .expiresAt(expiration.toInstant())
                            .revokedAt(Instant.now())
                            .build());
        } catch (DataIntegrityViolationException ignored) {
            // Idempotent logout for already-revoked token in race conditions.
        }
    }

    private String extractTokenUsername(String refreshToken) {
        try {
            return jwtService.extractUsername(refreshToken);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }
    }

    private String normalizeToken(String token) {
        return token == null ? "" : token.trim();
    }

    private boolean isRefreshTokenRevoked(String refreshToken) {
        return revokedRefreshTokenRepository.existsByTokenHash(hashToken(refreshToken));
    }

    private void removeExpiredRevokedTokens() {
        revokedRefreshTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is not available", ex);
        }
    }
}
