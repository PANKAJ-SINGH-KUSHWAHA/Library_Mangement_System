package com.pankaj.backend.service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pankaj.backend.entity.Notification;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.NotificationRepository;
import com.pankaj.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Transactional
    public Notification createInAppNotification(User user, String message) {
        Notification n = Notification.builder()
                .message(message)
                .isRead(false)
                .createdAt(new Date())
                .user(user)
                .build();
        log.debug("Creating in-app notification for user {} : {}", userSafe(user), message);
        return notificationRepository.save(n);
    }

    /**
     * Persist a notification and attempt to send an email (best-effort).
     * In-app notification will be stored even if email fails.
     */
    @Transactional
    public Notification createAndSendEmailNotification(User user, String subject, String htmlBody) {
        String preview = subject + " | " + (htmlBody == null ? "" :
                (htmlBody.length() > 250 ? htmlBody.substring(0, 250) + "..." : htmlBody));
        Notification n = Notification.builder()
                .message(preview)
                .isRead(false)
                .createdAt(new Date())
                .user(user)
                .build();

        Notification saved = notificationRepository.save(n);
        log.debug("Saved notification id={} for user={}", saved.getId(), userSafe(user));

        // Fire-and-forget send (EmailService should be @Async). If it throws, log and continue.
        try {
            if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendEmail(user.getEmail(), subject, htmlBody);
                log.debug("Attempted to send email to {}", user.getEmail());
            } else {
                log.debug("User email missing, skipping email send for user {}", userSafe(user));
            }
        } catch (Exception ex) {
            // Do not rethrow — keep in-app notification saved.
            log.error("Failed to send notification email to {} : {}", userSafe(user), ex.getMessage(), ex);
        }
        return saved;
    }

    public List<Notification> getUnreadForUser(User user) {
        return notificationRepository.findByIsReadFalseAndUser(user);
    }

    public List<Notification> getAllForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
            log.debug("Marked notification {} as read", notificationId);
        });
    }

    /**
     * Notify all admins & librarians.
     * Uses a repository query to find users with roles ADMIN or LIBRARIAN.
     */
    @Transactional
    public void notifyAdmins(String subject, String htmlBody) {
        try {
            List<User> notifyUsers = userRepository.findByRole_NameIn(List.of("ADMIN", "LIBRARIAN"));
            if (notifyUsers == null || notifyUsers.isEmpty()) {
                log.warn("notifyAdmins: no admin/librarian users found");
                return;
            }
            notifyUsers.stream()
                .filter(Objects::nonNull)
                .distinct()
                .forEach(u -> {
                    try {
                        createAndSendEmailNotification(u, subject, htmlBody);
                    } catch (Exception ex) {
                        log.error("notifyAdmins: failed for user {} : {}", userSafe(u), ex.getMessage(), ex);
                    }
                });
            log.debug("notifyAdmins: dispatched notifications to {} users", notifyUsers.size());
        } catch (Exception e) {
            log.error("notifyAdmins: unexpected error: {}", e.getMessage(), e);
        }
    }

    private String userSafe(User u) {
        if (u == null) return "null";
        return (u.getFirstName() != null ? u.getFirstName() : "") + " <" + (u.getEmail() != null ? u.getEmail() : "no-email") + ">";
    }
}
