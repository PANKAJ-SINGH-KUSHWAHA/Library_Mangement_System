package com.pankaj.backend.controller;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.pankaj.backend.dto.AuthRequest;
import com.pankaj.backend.dto.AuthResponse;
import com.pankaj.backend.entity.Role;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.RoleRepository;
import com.pankaj.backend.repository.UserRepository;
import com.pankaj.backend.security.JwtUtil;
import com.pankaj.backend.service.EmailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @PostMapping("/register")
    public String register(@RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already registered";
        }

        Role memberRole = roleRepository.findByName("MEMBER").orElseThrow();
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(memberRole)
                .enabled(false)
                .joinDate(new Date())
                .verificationCode(UUID.randomUUID().toString())
                .build();

        userRepository.save(user);

        String verificationLink = "http://localhost:8081/api/auth/verify?code=" + user.getVerificationCode();
        emailService.sendEmail(
                user.getEmail(),
                "Verify your Library account",
                "Click <a href='" + verificationLink + "'>here</a> to verify your email."
        );

        return "User registered successfully. Please check your email to verify your account.";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Wrong email or password");
        } catch (DisabledException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please verify your email first.");
        }

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        user.setActive(true);
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getName());

        AuthResponse response = new AuthResponse(token, user.getRole().getName(),
                user.getFirstName(), user.getEmail());
        return ResponseEntity.ok(response);
    }



    @GetMapping("/verify")
    public String verifyEmail(@RequestParam String code) {
        User user = userRepository.findByVerificationCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid verification code"));
        user.setEnabled(true);
        user.setVerificationCode(null);
        userRepository.save(user);
        return "Email verified successfully!";
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found"));

        // Generate 6-digit OTP
        String otp = String.valueOf((int) ((Math.random() * 900000) + 100000));
        user.setResetOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send email
        emailService.sendEmail(
                user.getEmail(),
                "Password Reset OTP",
                "<p>Your password reset OTP is <b>" + otp + "</b>. It is valid for 10 minutes.</p>"
        );

        // Return a clean JSON message
        return ResponseEntity.ok(Map.of("message", "OTP sent to your registered email."));
    }

    @PostMapping("/password-reset/verify")
    public ResponseEntity<Map<String, String>> verifyOtpAndResetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found"));

        // Validate OTP
        if (user.getResetOtp() == null || !otp.equals(user.getResetOtp())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid OTP"));
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "OTP expired"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successful!"));
    }


    @PostMapping("/password-change")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password changed successfully!");
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> payload) {
    String email = payload.get("email");

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    user.setActive(false);
    userRepository.save(user);

    return ResponseEntity.ok(Map.of("message", "User logged out successfully"));
}

}
