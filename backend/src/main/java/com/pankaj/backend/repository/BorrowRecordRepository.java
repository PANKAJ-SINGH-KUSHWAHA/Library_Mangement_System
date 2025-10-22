package com.pankaj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pankaj.backend.entity.Book;
import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.BorrowStatus;
import com.pankaj.backend.entity.User;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    // Fetch all borrow records for a given user
    List<BorrowRecord> findByUser(User user);

    // Check if a user already has an active (not returned) borrow of a book
    boolean existsByUserAndBookAndStatus(User user, Book book, BorrowStatus status);

    // Optionally: find a record by user, book, and active status (useful for return logic)
    Optional<BorrowRecord> findByUserAndBookAndStatus(User user, Book book, BorrowStatus status);

    // (Optional) Get all currently borrowed (active) records — could help librarian/admin view
    List<BorrowRecord> findByStatus(BorrowStatus status);
}
