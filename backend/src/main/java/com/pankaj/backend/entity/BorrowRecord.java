package com.pankaj.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "borrow_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Temporal(TemporalType.DATE)
    private Date borrowDate;

    @Temporal(TemporalType.DATE)
    private Date dueDate;

    @Temporal(TemporalType.DATE)
    private Date returnDate;

    @Enumerated(EnumType.STRING)
    private BorrowStatus status = BorrowStatus.BORROWED;

    @PrePersist
    public void setDueDateDefault() {
        if (dueDate == null) {
            dueDate = new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000); // 7 days from now
        }
    }

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
}
