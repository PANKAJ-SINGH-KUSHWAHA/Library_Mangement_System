package com.pankaj.backend.config;

import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.pankaj.backend.entity.Role;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.RoleRepository;
import com.pankaj.backend.repository.UserRepository;
import com.pankaj.backend.service.EmailService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public void run(String... args) {

        // 1️⃣ Create roles if not exist
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, "ADMIN"));
            roleRepository.save(new Role(null, "LIBRARIAN"));
            roleRepository.save(new Role(null, "MEMBER"));
        }

        // 2️⃣ Create default admin if not exist
        String adminEmail = "2k22.csaiml.2213319@gmail.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            String verificationCode = UUID.randomUUID().toString();

            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Admin")
                    .role(adminRole)
                    .enabled(false) // must verify email
                    .verificationCode(verificationCode)
                    .build();

            userRepository.save(admin);

            // Send verification email
            String verificationLink = "http://localhost:8081/api/auth/verify?code=" + verificationCode;
            emailService.sendEmail(
                    adminEmail,
                    "Verify your Library Admin account",
                    "Click <a href='" + verificationLink + "'>here</a> to verify your email."
            );

            System.out.println("✅ Default admin created. Verification email sent to " + adminEmail);
        }
    }
}
