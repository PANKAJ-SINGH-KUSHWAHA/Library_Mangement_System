package com.pankaj.backend.repository;

import java.util.Date;
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

    // Fetch all borrow records for a given user (load book + user to avoid lazy issues)
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user WHERE br.user = :user")
    List<BorrowRecord> findByUser(@Param("user") User user);

    // Check if a user already has an active (not returned) borrow of a book
    boolean existsByUserAndBookAndStatus(User user, Book book, BorrowStatus status);

    // Optionally: find a record by user, book, and active status (useful for return logic)
    Optional<BorrowRecord> findByUserAndBookAndStatus(User user, Book book, BorrowStatus status);

    // Get borrow records by status (e.g., BORROWED)
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user WHERE br.status = :status")
    List<BorrowRecord> findByStatus(@Param("status") BorrowStatus status);
    
    // Count active borrows for a user (useful to enforce plan limits)
    int countByUserAndStatus(User user, BorrowStatus status);
    
    // Fetch all borrow records with user and book details
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user")
    List<BorrowRecord> findAllWithDetails();

    // Get all borrow records for a specific book
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user WHERE br.book = :book")
    List<BorrowRecord> findByBook(@Param("book") Book book);

    // --- Methods required by scheduler ---

    /**
     * Find all BORROWED records whose dueDate is strictly before 'before'
     * (used to detect overdues).
     */
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user WHERE br.status = :status AND br.dueDate < :before")
    List<BorrowRecord> findByStatusAndDueDateBefore(@Param("status") BorrowStatus status, @Param("before") Date before);

    /**
     * Find BORROWED records with dueDate between start (inclusive) and end (exclusive).
     * Used for "due in 2 days" reminder window.
     */
    @Query("SELECT br FROM BorrowRecord br JOIN FETCH br.book JOIN FETCH br.user WHERE br.status = :status AND br.dueDate >= :start AND br.dueDate < :end")
    List<BorrowRecord> findByStatusAndDueDateBetween(@Param("status") BorrowStatus status, @Param("start") Date start, @Param("end") Date end);
}
