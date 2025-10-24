package com.pankaj.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pankaj.backend.entity.Book;
import com.pankaj.backend.repository.BookRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin
public class BookController {

    private final BookRepository bookRepository;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookRepository.findByDeletedFalse();
        return ResponseEntity.ok(books);
    }


    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public Book addBook(@RequestBody Book book) {
        if (book.getAvailableCopies() == 0) book.setAvailableCopies(book.getTotalCopies());
        return bookRepository.save(book);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> updateBook(@PathVariable String id, @RequestBody Book updatedBook) {
        return bookRepository.findById(id)
                .map(book -> {
                    book.setTitle(updatedBook.getTitle());
                    book.setAuthor(updatedBook.getAuthor());
                    book.setPublisher(updatedBook.getPublisher());
                    book.setTotalCopies(updatedBook.getTotalCopies());
                    book.setAvailableCopies(updatedBook.getAvailableCopies());
                    book.setImageUrl(updatedBook.getImageUrl());
                    return ResponseEntity.ok(bookRepository.save(book));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> deleteBook(@PathVariable String id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Soft delete instead of hard delete
        book.setDeleted(true);
        bookRepository.save(book);

        return ResponseEntity.ok("Book soft-deleted successfully");
    }

}
