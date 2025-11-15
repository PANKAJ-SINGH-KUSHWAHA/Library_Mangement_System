package com.pankaj.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pankaj.backend.entity.Role;
import com.pankaj.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationCode(String verificationCode);

    Optional<User> findByResetOtp(String resetOtp);

    // Fetch users by Role entity
    List<User> findByRole(Role role);

    // Fetch users whose role name matches exactly (ADMIN, LIBRARIAN, etc.)
    List<User> findByRole_Name(String roleName);

    // Fetch users for multiple role names (ADMIN + LIBRARIAN)
    List<User> findByRole_NameIn(List<String> roleNames);
}
