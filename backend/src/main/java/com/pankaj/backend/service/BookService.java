package com.pankaj.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pankaj.backend.entity.Book;
import com.pankaj.backend.repository.BookRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(String id) {
        return bookRepository.findById(id);
    }

    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBook(String id, Book updatedBook) {
        return bookRepository.findById(id)
                .map(book -> {
                    book.setTitle(updatedBook.getTitle());
                    book.setAuthor(updatedBook.getAuthor());
                    book.setPublisher(updatedBook.getPublisher());
                    book.setTotalCopies(updatedBook.getTotalCopies());
                    book.setAvailableCopies(updatedBook.getAvailableCopies());
                    book.setPublishedDate(updatedBook.getPublishedDate());
                    return bookRepository.save(book);
                })
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    public void deleteBook(String id) {
        bookRepository.deleteById(id);
    }
}
