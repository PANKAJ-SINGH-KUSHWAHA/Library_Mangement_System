package com.pankaj.backend.config;

import com.pankaj.backend.entity.Role;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.RoleRepository;
import com.pankaj.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, "ADMIN"));
            roleRepository.save(new Role(null, "LIBRARIAN"));
            roleRepository.save(new Role(null, "MEMBER"));
        }

        if (userRepository.findByEmail("admin@librario.com").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            User admin = User.builder()
                    .email("admin@librario.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Admin")
                    .role(adminRole)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Default admin created: admin@librario.com / admin123");
        }
    }
}
