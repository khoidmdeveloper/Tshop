package com.project.tshop.auth.config;

import com.project.tshop.auth.entity.User;
import com.project.tshop.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedUsers();
    }

    private void seedUsers() {
        seedUser("admin@tshop.local", "Admin@123", "Admin Tshop", "0900000001", "admin");
        seedUser("customer1@tshop.local", "Customer@123", "Customer One", "0900000002", "customer");
        seedUser("customer2@tshop.local", "Customer@123", "Customer Two", "0900000003", "customer");
    }

    private void seedUser(String email, String rawPassword, String fullName, String phone, String role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .phone(phone)
                .role(role)
                .build();
        userRepository.save(user);
        log.info("Seeded user: {}", email);
    }
}
