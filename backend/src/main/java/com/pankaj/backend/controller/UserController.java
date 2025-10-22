package com.pankaj.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.BorrowStatus;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.BookRepository;
import com.pankaj.backend.repository.BorrowRecordRepository;
import com.pankaj.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;

    // Get all users
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Remove a member
    @DeleteMapping("/member/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
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


    // Admin marks a borrowed book as returned
    @PutMapping("/return/{recordId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> markReturn(@PathVariable Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            return ResponseEntity.badRequest().body("Book already returned");
        }

        record.setStatus(BorrowStatus.RETURNED);

        // Update book availability
        var book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        borrowRecordRepository.save(record);

        return ResponseEntity.ok("Book marked as returned successfully");
    }
}
