package com.pankaj.backend.config;

import java.util.Date;
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
                    .joinDate(new Date())
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

    String librarianEmail = "kushwahapankaj793@gmail.com";
    if (userRepository.findByEmail(librarianEmail).isEmpty()) {
        Role librarianRole = roleRepository.findByName("LIBRARIAN").orElseThrow();
        String verificationCode = UUID.randomUUID().toString();

        User librarian = User.builder()
            .email(librarianEmail)
            .password(passwordEncoder.encode("librarian123"))
            .firstName("Manager")
            .lastName("Librarian")
            .role(librarianRole)
            .enabled(false)
            .joinDate(new Date())
            .verificationCode(verificationCode)
            .build();

        userRepository.save(librarian);

        // Send verification email
        String verificationLink = "http://localhost:8081/api/auth/verify?code=" + verificationCode;
        emailService.sendEmail(
            librarianEmail,
            "Verify your Librarian account",
            "Click <a href='" + verificationLink + "'>here</a> to verify your email."
        );

        System.out.println("✅ Default Librarian created. Verification email sent to " + librarianEmail);
    }
    }
}
