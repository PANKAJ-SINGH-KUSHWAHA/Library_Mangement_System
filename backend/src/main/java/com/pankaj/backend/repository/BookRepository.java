package com.pankaj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pankaj.backend.entity.Book;


public interface BookRepository extends JpaRepository<Book, String> {

    List<Book> findByDeletedFalse(); // only non-deleted books

    Optional<Book> findByIdAndDeletedFalse(String id); // fetch a book by id only if not deleted
}
