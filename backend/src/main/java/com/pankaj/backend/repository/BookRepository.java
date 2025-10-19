package com.pankaj.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pankaj.backend.entity.Book;

public interface BookRepository extends JpaRepository<Book, String> {
}
