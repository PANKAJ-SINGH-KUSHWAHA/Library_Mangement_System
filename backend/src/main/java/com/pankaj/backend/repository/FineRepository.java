package com.pankaj.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pankaj.backend.entity.Fine;

public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByPaidFalse(); // for admin unpaid list
    List<Fine> findByBorrowRecordId(Long borrowRecordId);
}
