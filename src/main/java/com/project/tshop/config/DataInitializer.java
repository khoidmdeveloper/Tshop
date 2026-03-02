package com.project.tshop.config;

import com.project.tshop.entity.User;
import com.project.tshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin@tshop.local", "Admin@123", "admin", "System Admin", "0900000001");
        seedUser("customer1@tshop.local", "Customer@123", "customer", "Customer One", "0900000002");
        seedUser("customer2@tshop.local", "Customer@123", "customer", "Customer Two", "0900000003");
    }

    private void seedUser(String email, String rawPassword, String role, String fullName, String phone) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .fullName(fullName)
                .phone(phone)
                .build();

        userRepository.save(user);
    }
}
