package com.pankaj.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BorrowRecordDTO {
    private Long id;
    private String firstName;
    private String status;
    private String userEmail;
    private String bookTitle;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private BigDecimal overdueFine;

        
}

