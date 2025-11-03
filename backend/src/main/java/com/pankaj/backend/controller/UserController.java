package com.pankaj.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.BorrowStatus;
import com.pankaj.backend.entity.Role;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.BookRepository;
import com.pankaj.backend.repository.BorrowRecordRepository;
import com.pankaj.backend.repository.RoleRepository;
import com.pankaj.backend.repository.UserRepository;
import com.pankaj.backend.service.EmailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/member/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> removeMember(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (!"MEMBER".equals(user.getRole().getName())) {
                        return ResponseEntity.badRequest().body("Can only remove members");
                    }
                    userRepository.delete(user);
                    return ResponseEntity.ok("Member removed successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/librarian/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> removeLibrarian(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (!"LIBRARIAN".equals(user.getRole().getName())) {
                        return ResponseEntity.badRequest().body("Can only remove librarians");
                    }
                    userRepository.delete(user);
                    return ResponseEntity.ok("Librarian removed successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/return/{recordId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> markReturn(@PathVariable Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            return ResponseEntity.badRequest().body("Book already returned");
        }

        record.setStatus(BorrowStatus.RETURNED);

        var book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);
        borrowRecordRepository.save(record);

        return ResponseEntity.ok("Book marked as returned successfully");
    }

    @PostMapping("/member")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> addMember(@RequestBody User newUser) {
        // ✅ Check if email already exists
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }

        // ✅ Fetch MEMBER role
        Role memberRole = roleRepository.findByName("MEMBER")
                .orElseThrow(() -> new RuntimeException("Role MEMBER not found"));

        // ✅ Encode password
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        // ✅ Set default user attributes
        newUser.setRole(memberRole);
        newUser.setEnabled(false);
        newUser.setVerificationCode(UUID.randomUUID().toString());
        newUser.setJoinDate(new java.util.Date());

        userRepository.save(newUser);

        // ✅ Send verification email
        String verificationLink = "http://localhost:8081/api/auth/verify?code=" + newUser.getVerificationCode();
        emailService.sendEmail(
                newUser.getEmail(),
                "Verify your Library account",
                "Click <a href='" + verificationLink + "'>here</a> to verify your email."
        );

        return ResponseEntity.ok("Member added successfully. Please verify their email.");
    }

    @PostMapping("/librarian")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> addLibrarian(@RequestBody User newUser) {
        // ✅ Check if email already exists
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }

        // ✅ Fetch MEMBER role
        Role memberRole = roleRepository.findByName("LIBRARIAN")
                .orElseThrow(() -> new RuntimeException("Role Librarian not found"));

        // ✅ Encode password
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        // ✅ Set default user attributes
        newUser.setRole(memberRole);
        newUser.setEnabled(false);
        newUser.setVerificationCode(UUID.randomUUID().toString());
        newUser.setJoinDate(new java.util.Date());

        userRepository.save(newUser);

        // ✅ Send verification email
        String verificationLink = "http://localhost:8081/api/auth/verify?code=" + newUser.getVerificationCode();
        emailService.sendEmail(
                newUser.getEmail(),
                "Verify your Library account",
                "Click <a href='" + verificationLink + "'>here</a> to verify your email."
        );

        return ResponseEntity.ok("Librarian added successfully. Please verify their email.");
    }


    // ✅ Update user (with email verification + bcrypt password)
    @PutMapping("/user/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody User updatedUser
    ) {
        return userRepository.findById(id)
                .map(existingUser -> {

                    if (!existingUser.getEmail().equals(updatedUser.getEmail())) {
                        if (userRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
                            return ResponseEntity.badRequest().body("Email is already registered");
                        }

                        existingUser.setEmail(updatedUser.getEmail());
                        existingUser.setEnabled(false); // disable until reverified
                        existingUser.setVerificationCode(UUID.randomUUID().toString());

                        // Send verification email again
                        String verificationLink = "http://localhost:8081/api/auth/verify?code=" + existingUser.getVerificationCode();
                        emailService.sendEmail(
                                existingUser.getEmail(),
                                "Verify your updated email",
                                "Click <a href='" + verificationLink + "'>here</a> to verify your updated email."
                        );
                    }

                    existingUser.setFirstName(updatedUser.getFirstName());
                    existingUser.setLastName(updatedUser.getLastName());

                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
                        existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                    }

                    if (updatedUser.getRole() != null && updatedUser.getRole().getId() != null) {
                        Role role = roleRepository.findById(updatedUser.getRole().getId())
                                .orElseThrow(() -> new RuntimeException("Invalid role ID"));
                        existingUser.setRole(role);
                    }

                    userRepository.save(existingUser);
                    return ResponseEntity.ok("User updated successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
