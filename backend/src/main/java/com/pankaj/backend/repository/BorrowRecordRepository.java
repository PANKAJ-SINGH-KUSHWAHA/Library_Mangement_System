package com.pankaj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pankaj.backend.entity.Book;
import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.BorrowStatus;
import com.pankaj.backend.entity.User;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    // Fetch all borrow records for a given user
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user WHERE br.user = :user")
    List<BorrowRecord> findByUser(@Param("user") User user);

    // Check if a user already has an active (not returned) borrow of a book
    boolean existsByUserAndBookAndStatus(User user, Book book, BorrowStatus status);

    // Optionally: find a record by user, book, and active status (useful for return logic)
    Optional<BorrowRecord> findByUserAndBookAndStatus(User user, Book book, BorrowStatus status);

    // (Optional) Get all currently borrowed (active) records — could help librarian/admin view
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user WHERE br.status = :status")
    List<BorrowRecord> findByStatus(@Param("status") BorrowStatus status);
    
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user")
    List<BorrowRecord> findAllWithDetails();
}
