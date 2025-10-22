package com.pankaj.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;

    private String isbn;
    private String title;
    private String author;
    private String publisher;
    private int totalCopies;
    private int availableCopies;
    private Date publishedDate;
    private Date createdAt = new Date();

    // Many-to-many relationship with Category
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "book_categories",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();
    private boolean deleted = false;
}
