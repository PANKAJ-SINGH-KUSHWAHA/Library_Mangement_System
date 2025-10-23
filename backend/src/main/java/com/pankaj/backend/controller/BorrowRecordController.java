package com.pankaj.backend.controller;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pankaj.backend.dto.BorrowRecordDTO;
import com.pankaj.backend.dto.UserBorrowRecordDTO;
import com.pankaj.backend.entity.Book;
import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.BorrowStatus;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.BookRepository;
import com.pankaj.backend.repository.BorrowRecordRepository;
import com.pankaj.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
@CrossOrigin
public class BorrowRecordController {
    private static final Logger logger = LoggerFactory.getLogger(BorrowRecordController.class);

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    // Get all borrowed books by user
    @GetMapping("/{email}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN', 'MEMBER')")
    public ResponseEntity<?> getUserBorrowedBooks(@PathVariable String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<UserBorrowRecordDTO> recordDTOs = borrowRecordRepository.findByUser(user).stream()
                .map(record -> new UserBorrowRecordDTO(
                    record.getId(),
                    record.getBook().getTitle(),
                    record.getBorrowDate() != null ? 
                        new java.sql.Date(record.getBorrowDate().getTime()).toLocalDate() : 
                        null,
                    record.getDueDate() != null ? 
                        new java.sql.Date(record.getDueDate().getTime()).toLocalDate() : 
                        null,
                    record.getReturnDate() != null ? 
                        new java.sql.Date(record.getReturnDate().getTime()).toLocalDate() : 
                        null,
                    record.getStatus().toString()
                ))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(recordDTOs);
        } catch (Exception e) {
            logger.error("Error fetching borrow records for user {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching borrow records: " + e.getMessage());
        }
    }

        @GetMapping("/book/{bookId}")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
        public ResponseEntity<List<BorrowRecordDTO>> getBookBorrowHistory(@PathVariable String bookId) {
            try {
                Book book = bookRepository.findById(bookId)
                        .orElseThrow(() -> new RuntimeException("Book not found"));
            
                List<BorrowRecordDTO> dtos = borrowRecordRepository.findByBook(book).stream()
                    .map(r -> new BorrowRecordDTO(
                        r.getId(),
                        r.getUser().getFirstName(),
                        r.getStatus().toString(),
                        r.getUser().getEmail(),
                        r.getBook().getTitle(),
                        r.getDueDate() != null ? 
                            new java.sql.Date(r.getDueDate().getTime()).toLocalDate() : 
                            null,
                        r.getReturnDate() != null ? 
                            new java.sql.Date(r.getReturnDate().getTime()).toLocalDate() : 
                            null
                    ))
                    .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
            } catch (Exception e) {
                logger.error("Error fetching borrow records for book {}: {}", bookId, e.getMessage());
                return ResponseEntity.badRequest().body(null);
            }
        }

    //  Borrow a book
    @PostMapping("/{bookId}")
    @PreAuthorize("hasAuthority('MEMBER')")
    public ResponseEntity<?> borrowBook(@PathVariable String bookId, @RequestParam String email) {
        //Fetch user and book
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        //Check if already borrowed and not yet returned
        boolean alreadyBorrowed = borrowRecordRepository.existsByUserAndBookAndStatus(user, book, BorrowStatus.BORROWED);
        if (alreadyBorrowed) {
            return ResponseEntity.badRequest().body("You have already borrowed this book. Please return it first.");
        }

        //Check availability
        if (book.getAvailableCopies() <= 0) {
            return ResponseEntity.badRequest().body("Book is not available currently.");
        }

        //Update available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // Create borrow record
        BorrowRecord record = BorrowRecord.builder()
                .user(user)
                .book(book)
                .borrowDate(new Date())
                .dueDate(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000)) // 7 days later
                .status(BorrowStatus.BORROWED)
                .build();

        BorrowRecord savedRecord = borrowRecordRepository.save(record);

        return ResponseEntity.ok(savedRecord);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<BorrowRecordDTO>> getAllBorrows() {
        try {
            List<BorrowRecordDTO> dtos = borrowRecordRepository.findAllWithDetails().stream()
                .map(r -> new BorrowRecordDTO(
                    r.getId(),
                    r.getUser().getFirstName(),
                    r.getStatus().toString(),
                    r.getUser().getEmail(),
                    r.getBook().getTitle(),
                    r.getDueDate() != null ? 
                        new java.sql.Date(r.getDueDate().getTime()).toLocalDate() : 
                        null,
                    r.getReturnDate() != null ? 
                        new java.sql.Date(r.getReturnDate().getTime()).toLocalDate() : 
                        null
                ))
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching borrow records: ", e);
            return ResponseEntity.badRequest().body(null);
        }
    }



    @PutMapping("/return/{recordId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')") // Only admin/librarian can mark return
    public ResponseEntity<?> returnBook(@PathVariable Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            return ResponseEntity.badRequest().body("Book already returned.");
        }

        record.setStatus(BorrowStatus.RETURNED);
        record.setReturnDate(new Date());

        // Update book availability
        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return ResponseEntity.ok(borrowRecordRepository.save(record));
    }

}
