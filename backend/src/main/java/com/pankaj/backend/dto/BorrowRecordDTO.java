package com.pankaj.backend.dto;

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
    
}

