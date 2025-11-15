package com.pankaj.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pankaj.backend.entity.Notification;
import com.pankaj.backend.entity.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIsReadFalseAndUser(User user);
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}
