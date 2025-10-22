package com.pankaj.backend.service;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.pankaj.backend.entity.Book;
import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.BorrowStatus;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.BookRepository;
import com.pankaj.backend.repository.BorrowRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BorrowRecordService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;

    public List<BorrowRecord> getBorrowedBooks(User user) {
        return borrowRecordRepository.findByUser(user);
    }

    public BorrowRecord borrowBook(User user, String bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0)
            throw new RuntimeException("Book not available");

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BorrowRecord record = BorrowRecord.builder()
                .user(user)
                .book(book)
                .borrowDate(new Date())
                .dueDate(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000)) // 7 days
                .status(BorrowStatus.BORROWED)
                .build();

        return borrowRecordRepository.save(record);
    }

    public BorrowRecord returnBook(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (record.getStatus() == BorrowStatus.RETURNED)
            throw new RuntimeException("Book already returned");

        record.setReturnDate(new Date());
        record.setStatus(BorrowStatus.RETURNED);

        // Increase available copies
        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return borrowRecordRepository.save(record);
    }
}
