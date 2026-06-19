package com.project.tshop.auth.repository;

import com.project.tshop.auth.entity.RevokedRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface RevokedRefreshTokenRepository extends JpaRepository<RevokedRefreshToken, UUID> {
    boolean existsByTokenHash(String tokenHash);
    void deleteByExpiresAtBefore(Instant cutoff);
}
