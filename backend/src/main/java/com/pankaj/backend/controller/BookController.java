package com.pankaj.backend.controller;

import com.pankaj.backend.entity.Book;
import com.pankaj.backend.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin
public class BookController {

    private final BookRepository bookRepository;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public Book addBook(@RequestBody Book book) {
        if (book.getAvailableCopies() == 0) book.setAvailableCopies(book.getTotalCopies());
        return bookRepository.save(book);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> updateBook(@PathVariable String id, @RequestBody Book updatedBook) {
        return bookRepository.findById(id)
                .map(book -> {
                    book.setTitle(updatedBook.getTitle());
                    book.setAuthor(updatedBook.getAuthor());
                    book.setCategory(updatedBook.getCategory());
                    book.setPublisher(updatedBook.getPublisher());
                    book.setTotalCopies(updatedBook.getTotalCopies());
                    book.setAvailableCopies(updatedBook.getAvailableCopies());
                    return ResponseEntity.ok(bookRepository.save(book));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> deleteBook(@PathVariable String id) {
        if (!bookRepository.existsById(id)) return ResponseEntity.notFound().build();
        bookRepository.deleteById(id);
        return ResponseEntity.ok("Book deleted successfully");
    }
}
