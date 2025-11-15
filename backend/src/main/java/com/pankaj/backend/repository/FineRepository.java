package com.pankaj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.Fine;

public interface FineRepository extends JpaRepository<Fine, Long> {

    // For admin unpaid list
    List<Fine> findByPaidFalse();

    // Find all fines for a specific borrow record (not frequently needed but okay)
    List<Fine> findByBorrowRecordId(Long borrowRecordId);

    // Scheduler needs this — check if fine already exists for overdue record
    Optional<Fine> findByBorrowRecord(BorrowRecord borrowRecord);
}
