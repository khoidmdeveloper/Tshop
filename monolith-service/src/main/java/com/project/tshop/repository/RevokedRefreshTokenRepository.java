package com.project.tshop.repository;

import com.project.tshop.entity.RevokedRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface RevokedRefreshTokenRepository extends JpaRepository<RevokedRefreshToken, UUID> {

    boolean existsByTokenHash(String tokenHash);

    void deleteByExpiresAtBefore(Instant now);
}
