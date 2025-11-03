package com.pankaj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pankaj.backend.entity.Book;


public interface BookRepository extends JpaRepository<Book, String> {

    List<Book> findByDeletedFalse(); // only non-deleted books

    Optional<Book> findByIdAndDeletedFalse(String id); // fetch a book by id only if not deleted

    // Search and filter methods
    List<Book> findByTitleContainingIgnoreCaseAndDeletedFalse(String title);
    List<Book> findByAuthorContainingIgnoreCaseAndDeletedFalse(String author);
    List<Book> findByPublisherContainingIgnoreCaseAndDeletedFalse(String publisher);
    List<Book> findByCategories_NameAndDeletedFalse(String category);
    List<Book> findByAvailableCopiesGreaterThanAndDeletedFalse(int availableCopies);
    List<Book> findByAvailableCopiesEqualsAndDeletedFalse(int availableCopies);
}
