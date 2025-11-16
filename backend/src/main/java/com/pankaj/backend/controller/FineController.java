package com.pankaj.backend.controller;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.Fine;
import com.pankaj.backend.repository.BorrowRecordRepository;
import com.pankaj.backend.repository.FineRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
@CrossOrigin
public class FineController {
    private static final Logger logger = LoggerFactory.getLogger(FineController.class);

    private final FineRepository fineRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    // DTO returned to clients
    public static class FineDTO {
        public Long fineId;
        public Long borrowRecordId;
        public String bookTitle;
        public String userEmail;
        public java.math.BigDecimal amount;
        public Boolean paid;
        public Date createdAt;
        public Date paidAt;
        public String paidBy;
        public Date dueDate;
        public Date returnDate;
        public String damageNote;    // optional if you add to BorrowRecord/Fine
        public Boolean damaged;     // optional
    }

    // Get fines for currently authenticated user
    @GetMapping("/my")
    public ResponseEntity<?> getMyFines() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = (auth != null) ? auth.getName() : null;
            if (email == null) return ResponseEntity.status(401).body("Unauthorized");

            // Find fines where fine.borrowRecord.user.email == email
            List<Fine> fines = fineRepository.findAll(); // small app: filter in memory; optimize with query if needed
            List<FineDTO> dtos = fines.stream()
                    .filter(f -> {
                        BorrowRecord br = f.getBorrowRecord();
                        return br != null && br.getUser() != null && email.equals(br.getUser().getEmail());
                    })
                    .map(f -> {
                        BorrowRecord br = f.getBorrowRecord();
                        FineDTO d = new FineDTO();
                        d.fineId = f.getId();
                        d.borrowRecordId = br != null ? br.getId() : null;
                        d.bookTitle = br != null && br.getBook() != null ? br.getBook().getTitle() : null;
                        d.userEmail = br != null && br.getUser() != null ? br.getUser().getEmail() : null;
                        d.amount = f.getAmount();
                        d.paid = f.getPaid();
                        d.createdAt = f.getCreatedAt();
                        d.paidAt = f.getPaidAt();
                        d.paidBy = f.getPaidBy();
                        d.dueDate = br != null ? br.getDueDate() : null;
                        d.returnDate = br != null ? br.getReturnDate() : null;
                        // if you add damage metadata to borrow record or fine, fill those here:
                        // d.damaged = br != null ? br.getDamaged() : null;
                        // d.damageNote = br != null ? br.getDamageNote() : null;
                        return d;
                    }).collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching user fines: ", e);
            return ResponseEntity.badRequest().body("Error fetching fines: " + e.getMessage());
        }
    }

    // Allow a member to mark their own fine as paid (simple flow).
    // If you use an external payment gateway, replace this with a webhook flow.
    @PutMapping("/{fineId}/pay-by-user")
    @Transactional
    public ResponseEntity<?> payFineByUser(@PathVariable Long fineId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = (auth != null) ? auth.getName() : null;
            if (email == null) return ResponseEntity.status(401).body("Unauthorized");

            Fine fine = fineRepository.findById(fineId)
                    .orElseThrow(() -> new RuntimeException("Fine not found"));

            BorrowRecord br = fine.getBorrowRecord();
            if (br == null || br.getUser() == null || !email.equals(br.getUser().getEmail())) {
                return ResponseEntity.status(403).body("You are not allowed to pay this fine");
            }

            if (fine.getPaid()) {
                return ResponseEntity.badRequest().body("Fine already paid.");
            }

            fine.setPaid(true);
            fine.setPaidAt(new Date());
            fine.setPaidBy(email);
            fineRepository.save(fine);

            // Optionally update borrow record overdueFine
            if (br != null) {
                br.setOverdueFine(java.math.BigDecimal.ZERO);
                borrowRecordRepository.save(br);
            }

            return ResponseEntity.ok("Fine marked as paid");
        } catch (Exception e) {
            logger.error("Error paying fine by user: ", e);
            return ResponseEntity.badRequest().body("Error paying fine: " + e.getMessage());
        }
    }

    // Get unpaid fines for currently authenticated user
    @GetMapping("/my/unpaid")
    public ResponseEntity<?> getMyUnpaidFines() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = (auth != null) ? auth.getName() : null;
            if (email == null) return ResponseEntity.status(401).body("Unauthorized");

            List<Fine> fines = fineRepository.findAll();
            List<FineDTO> dtos = fines.stream()
                .filter(f -> {
                    BorrowRecord br = f.getBorrowRecord();
                    return br != null
                        && br.getUser() != null
                        && email.equals(br.getUser().getEmail())
                        && (f.getPaid() == null || !f.getPaid()); // only unpaid
                })
                .map(f -> {
                    BorrowRecord br = f.getBorrowRecord();
                    FineDTO d = new FineDTO();
                    d.fineId = f.getId();
                    d.borrowRecordId = br != null ? br.getId() : null;
                    d.bookTitle = br != null && br.getBook() != null ? br.getBook().getTitle() : null;
                    d.userEmail = br != null && br.getUser() != null ? br.getUser().getEmail() : null;
                    d.amount = f.getAmount();
                    d.paid = f.getPaid();
                    d.createdAt = f.getCreatedAt();
                    d.paidAt = f.getPaidAt();
                    d.paidBy = f.getPaidBy();
                    d.dueDate = br != null ? br.getDueDate() : null;
                    d.returnDate = br != null ? br.getReturnDate() : null;
                    return d;
                }).collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching user unpaid fines: ", e);
            return ResponseEntity.badRequest().body("Error fetching unpaid fines: " + e.getMessage());
        }
    }

}
