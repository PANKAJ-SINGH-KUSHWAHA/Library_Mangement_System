package com.pankaj.backend.controller;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
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
import com.pankaj.backend.entity.Fine;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.BookRepository;
import com.pankaj.backend.repository.BorrowRecordRepository;
import com.pankaj.backend.repository.FineRepository;
import com.pankaj.backend.repository.MembershipSettingsRepository;
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
    private final MembershipSettingsRepository membershipSettingsRepository;
    private final FineRepository fineRepository;

    // business constants
    private static final int RENEWAL_FREE = 0;
    private static final int RENEWAL_STANDARD = 1;
    private static final int RENEWAL_PREMIUM = 3;
    private static final int RENEW_EXTEND_DAYS = 7;
    private static final BigDecimal FINE_PER_DAY = new BigDecimal("15");
    private static final int DEFAULT_LOAN_DAYS = 7;
    private static final int DEFAULT_BORROW_LIMIT = 2;

    // ---------------- RENEW ----------------
    @PutMapping("/renew/{recordId}")
    @PreAuthorize("hasAuthority('MEMBER') or hasAnyAuthority('ADMIN','LIBRARIAN')")
    @Transactional
    public ResponseEntity<?> renewBook(@PathVariable Long recordId, @RequestParam(required = false) String email) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() != BorrowStatus.BORROWED) {
            return ResponseEntity.badRequest().body("Only borrowed books can be renewed.");
        }

        // Ownership check for members (optional)
        if (email != null && !record.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(403).body("You cannot renew a record that isn't yours.");
        }

        // Determine user's plan and allowed renewals
        int allowedRenewals = RENEWAL_FREE;
        if (record.getUser() != null && record.getUser().getPlan() != null && record.getUser().getPlan().getName() != null) {
            String planName = record.getUser().getPlan().getName().toLowerCase();
            if (planName.contains("premium")) allowedRenewals = RENEWAL_PREMIUM;
            else if (planName.contains("standard")) allowedRenewals = RENEWAL_STANDARD;
            else allowedRenewals = RENEWAL_FREE;
        } else {
            allowedRenewals = RENEWAL_FREE;
        }

        if (record.getRenewCount() == null) record.setRenewCount(0);

        if (record.getRenewCount() >= allowedRenewals) {
            String msg;
            if (allowedRenewals == 0) msg = "You have a free plan — renewals are not allowed.";
            else msg = "Renewal limit reached for your plan.";
            return ResponseEntity.badRequest().body(msg);
        }

        // Extend due date by RENEW_EXTEND_DAYS
        Date existingDue = record.getDueDate() != null ? record.getDueDate() : new Date();
        long extendMillis = (long) RENEW_EXTEND_DAYS * 24 * 60 * 60 * 1000;
        Date newDue = new Date(existingDue.getTime() + extendMillis);
        record.setDueDate(newDue);

        // increment renew count
        record.setRenewCount(record.getRenewCount() + 1);

        BorrowRecord saved = borrowRecordRepository.save(record);
        return ResponseEntity.ok(saved);
    }

    // ---------------- RETURN (calculate fine @ ₹15/day) ----------------
    @PutMapping("/return/{recordId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    @Transactional
    public ResponseEntity<?> returnBook(@PathVariable Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            return ResponseEntity.badRequest().body("Book already returned.");
        }

        Date returnNow = new Date();
        record.setReturnDate(returnNow);
        record.setStatus(BorrowStatus.RETURNED);

        long overdueDays = 0;
        if (record.getDueDate() != null) {
            long diffMillis = returnNow.getTime() - record.getDueDate().getTime();
            overdueDays = diffMillis <= 0 ? 0 : (diffMillis / (1000 * 60 * 60 * 24));
        }

        BigDecimal totalFine = BigDecimal.ZERO;
        if (overdueDays > 0) {
            totalFine = FINE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays));
            record.setOverdueFine(totalFine);

            Fine fine = Fine.builder()
                    .borrowRecord(record)
                    .amount(totalFine)
                    .paid(false)
                    .createdAt(new Date())
                    .build();
            fineRepository.save(fine);
        } else {
            record.setOverdueFine(BigDecimal.ZERO);
        }

        // update book availability
        Book book = record.getBook();
        if (book != null) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }

        BorrowRecord saved = borrowRecordRepository.save(record);
        return ResponseEntity.ok(saved);
    }

    // ---------------- Admin: List unpaid fines ----------------
    @GetMapping("/admin/unpaid-fines")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> getUnpaidFines() {
        List<Fine> unpaid = fineRepository.findByPaidFalse();
        // Map to DTO for simpler response (include user and book and borrow record id)
        List<Map<String, Object>> dtos = unpaid.stream().map(f -> {
            BorrowRecord br = f.getBorrowRecord();
            Map<String, Object> m = new HashMap<>();
            m.put("fineId", f.getId());
            m.put("amount", f.getAmount());
            m.put("paid", f.getPaid());
            m.put("createdAt", f.getCreatedAt());
            m.put("borrowRecordId", br != null ? br.getId() : null);
            if (br != null && br.getUser() != null) {
                m.put("userId", br.getUser().getId());
                m.put("userEmail", br.getUser().getEmail());
                m.put("userName", br.getUser().getFirstName() + (br.getUser().getLastName() != null ? " " + br.getUser().getLastName() : ""));
            } else {
                m.put("userId", null);
                m.put("userEmail", null);
                m.put("userName", null);
            }
            if (br != null && br.getBook() != null) {
                m.put("bookId", br.getBook().getId());
                m.put("bookTitle", br.getBook().getTitle());
            } else {
                m.put("bookId", null);
                m.put("bookTitle", null);
            }
            m.put("dueDate", br != null ? br.getDueDate() : null);
            m.put("returnDate", br != null ? br.getReturnDate() : null);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ---------------- Admin: All fines / transaction history ----------------
    @GetMapping("/admin/fines")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> getAllFines() {
        List<Fine> all = fineRepository.findAll();
        List<Map<String, Object>> dtos = all.stream().map(f -> {
            BorrowRecord br = f.getBorrowRecord();
            Map<String, Object> m = new HashMap<>();
            m.put("fineId", f.getId());
            m.put("amount", f.getAmount());
            m.put("paid", f.getPaid());
            m.put("createdAt", f.getCreatedAt());
            m.put("paidAt", f.getPaidAt());
            m.put("paidBy", f.getPaidBy());
            m.put("borrowRecordId", br != null ? br.getId() : null);
            if (br != null && br.getUser() != null) {
                m.put("userId", br.getUser().getId());
                m.put("userEmail", br.getUser().getEmail());
                m.put("userName", br.getUser().getFirstName() + (br.getUser().getLastName() != null ? " " + br.getUser().getLastName() : ""));
            } else {
                m.put("userId", null);
                m.put("userEmail", null);
                m.put("userName", null);
            }
            if (br != null && br.getBook() != null) {
                m.put("bookId", br.getBook().getId());
                m.put("bookTitle", br.getBook().getTitle());
            } else {
                m.put("bookId", null);
                m.put("bookTitle", null);
            }
            m.put("dueDate", br != null ? br.getDueDate() : null);
            m.put("returnDate", br != null ? br.getReturnDate() : null);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ---------------- Admin: Pay fine (mark as paid) ----------------
    @PutMapping("/fines/{fineId}/pay")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    @Transactional
    public ResponseEntity<?> payFine(@PathVariable Long fineId, @RequestParam(required = false) String paidBy) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        if (fine.getPaid()) {
            return ResponseEntity.badRequest().body("Fine already paid.");
        }
        fine.setPaid(true);
        fine.setPaidAt(new Date());
        fine.setPaidBy(paidBy);
        fineRepository.save(fine);

        // optionally set overdueFine on BorrowRecord to zero and persist
        BorrowRecord br = fine.getBorrowRecord();
        if (br != null) {
            br.setOverdueFine(BigDecimal.ZERO);
            borrowRecordRepository.save(br);
        }

        return ResponseEntity.ok(fine);
    }

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
                            record.getBook() != null ? record.getBook().getTitle() : null,
                            record.getBorrowDate() != null ?
                                    new java.sql.Date(record.getBorrowDate().getTime()).toLocalDate() :
                                    null,
                            record.getDueDate() != null ?
                                    new java.sql.Date(record.getDueDate().getTime()).toLocalDate() :
                                    null,
                            record.getReturnDate() != null ?
                                    new java.sql.Date(record.getReturnDate().getTime()).toLocalDate() :
                                    null,
                            record.getStatus() != null ? record.getStatus().toString() : null,
                            record.getOverdueFine()
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
                            r.getUser() != null ? r.getUser().getFirstName() : null,
                            r.getStatus() != null ? r.getStatus().toString() : null,
                            r.getUser() != null ? r.getUser().getEmail() : null,
                            r.getBook() != null ? r.getBook().getTitle() : null,

                            r.getBorrowDate() != null
                                    ? new java.sql.Date(r.getBorrowDate().getTime()).toLocalDate()
                                    : null,

                            r.getDueDate() != null
                                    ? new java.sql.Date(r.getDueDate().getTime()).toLocalDate()
                                    : null,

                            r.getReturnDate() != null
                                    ? new java.sql.Date(r.getReturnDate().getTime()).toLocalDate()
                                    : null,

                            r.getOverdueFine()
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
    @Transactional
    public ResponseEntity<?> borrowBook(@PathVariable String bookId, @RequestParam String email) {
        // Fetch user and book
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Enforce membership borrow limit
        int currentBorrowed = borrowRecordRepository.countByUserAndStatus(user, BorrowStatus.BORROWED);
        int limit = Optional.ofNullable(user.getPlan()).map(p -> p.getBorrowLimit()).orElse(DEFAULT_BORROW_LIMIT);
        if (currentBorrowed >= limit) {
            return ResponseEntity.badRequest().body("Borrow limit reached for your membership plan.");
        }

        // Check if already borrowed and not yet returned for this same book
        boolean alreadyBorrowed = borrowRecordRepository.existsByUserAndBookAndStatus(user, book, BorrowStatus.BORROWED);
        if (alreadyBorrowed) {
            return ResponseEntity.badRequest().body("You have already borrowed this book. Please return it first.");
        }

        // Check availability
        if (book.getAvailableCopies() <= 0) {
            return ResponseEntity.badRequest().body("Book is not available currently.");
        }

        // Update available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // Determine loan days from plan or default to 7
        int loanDays = DEFAULT_LOAN_DAYS;
        Date borrowNow = new Date();
        long loanMillis = (long) loanDays * 24 * 60 * 60 * 1000;
        BorrowRecord record = BorrowRecord.builder()
                .user(user)
                .book(book)
                .borrowDate(borrowNow)
                .dueDate(new Date(borrowNow.getTime() + loanMillis))
                .status(BorrowStatus.BORROWED)
                .overdueFine(BigDecimal.ZERO)
                .renewCount(0)
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
                            r.getUser() != null ? r.getUser().getFirstName() : null,
                            r.getStatus() != null ? r.getStatus().toString() : null,
                            r.getUser() != null ? r.getUser().getEmail() : null,
                            r.getBook() != null ? r.getBook().getTitle() : null,

                            // <-- borrowDate (new)
                            r.getBorrowDate() != null
                                    ? new java.sql.Date(r.getBorrowDate().getTime()).toLocalDate()
                                    : null,

                            // dueDate
                            r.getDueDate() != null
                                    ? new java.sql.Date(r.getDueDate().getTime()).toLocalDate()
                                    : null,

                            // returnDate
                            r.getReturnDate() != null
                                    ? new java.sql.Date(r.getReturnDate().getTime()).toLocalDate()
                                    : null,

                            r.getOverdueFine()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching borrow records: ", e);
            return ResponseEntity.badRequest().body(null);
        }
    }

}
