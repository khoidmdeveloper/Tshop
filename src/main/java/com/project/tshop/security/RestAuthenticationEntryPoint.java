package com.project.tshop.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        String message = resolveUnauthorizedMessage(request);

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(buildErrorBody(message));
    }

    private String resolveUnauthorizedMessage(HttpServletRequest request) {
        Object jwtError = request.getAttribute(JwtAuthenticationFilter.JWT_AUTH_ERROR_ATTRIBUTE);
        if (jwtError instanceof ExpiredJwtException) {
            return "Access token expired.";
        }
        if (jwtError instanceof JwtException || jwtError instanceof IllegalArgumentException) {
            return "Invalid access token.";
        }
        return "Authentication required.";
    }

    private String buildErrorBody(String message) {
        return "{\"success\":false,"
                + "\"message\":\"" + escapeJson(message) + "\","
                + "\"data\":null,"
                + "\"timestamp\":\"" + LocalDateTime.now() + "\"}";
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
