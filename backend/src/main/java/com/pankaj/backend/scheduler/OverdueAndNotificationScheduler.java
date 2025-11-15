package com.pankaj.backend.scheduler;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.pankaj.backend.entity.Book;
import com.pankaj.backend.entity.BorrowRecord;
import com.pankaj.backend.entity.BorrowStatus;
import com.pankaj.backend.entity.Fine;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.BookRepository;
import com.pankaj.backend.repository.BorrowRecordRepository;
import com.pankaj.backend.repository.FineRepository;
import com.pankaj.backend.repository.UserRepository;
import com.pankaj.backend.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OverdueAndNotificationScheduler {

    private final BorrowRecordRepository borrowRecordRepository;
    private final FineRepository fineRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // business constants (keep consistent with your controller)
    private static final int LOW_STOCK_THRESHOLD = 3;
    private static final BigDecimal FINE_PER_DAY = new BigDecimal("15");

    /**
     * Runs once per day at 01:00 AM Asia/Kolkata.
     * Cron format: second minute hour day month day-of-week
     * zone attribute ensures it runs in Asia/Kolkata timezone.
     */
    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void dailyOverdueAndReminderJob() {
        log.info("Scheduler started: dailyOverdueAndReminderJob");

        sendUpcomingDueReminders();
        processOverduesAndFines();
        notifyLowStockBooks();

        log.info("Scheduler finished: dailyOverdueAndReminderJob");
    }

    private void sendUpcomingDueReminders() {
        // send reminders for records due in exactly 2 days (or in range: today+2)
        LocalDate target = LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(2);
        Date startOfDay = Date.from(target.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant());
        Date endOfDay = Date.from(target.plusDays(1).atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant());

        List<BorrowRecord> dueSoon = borrowRecordRepository.findByStatusAndDueDateBetween(BorrowStatus.BORROWED, startOfDay, endOfDay);
        log.info("Found {} borrow records due in 2 days", dueSoon.size());

        for (BorrowRecord br : dueSoon) {
            User user = br.getUser();
            if (user == null) continue;

            String subject = "Reminder: book due in 2 days — " + (br.getBook() != null ? br.getBook().getTitle() : "");
            String body = buildUpcomingDueHtml(user, br);
            notificationService.createAndSendEmailNotification(user, subject, body);
        }
    }

    private void processOverduesAndFines() {
        Date now = new Date();
        List<BorrowRecord> overdueRecords = borrowRecordRepository.findByStatusAndDueDateBefore(BorrowStatus.BORROWED, now);
        log.info("Found {} overdue borrow records", overdueRecords.size());

        for (BorrowRecord br : overdueRecords) {
            // compute overdue days
            long diffMillis = now.getTime() - (br.getDueDate() != null ? br.getDueDate().getTime() : now.getTime());
            long overdueDays = diffMillis > 0 ? (diffMillis / (1000L * 60L * 60L * 24L)) : 0;
            if (overdueDays <= 0) continue;

            // create fine if not exists
            if (fineRepository.findByBorrowRecord(br).isEmpty()) {
                BigDecimal total = FINE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays));
                Fine fine = Fine.builder()
                        .borrowRecord(br)
                        .amount(total)
                        .paid(false)
                        .createdAt(new Date())
                        .build();
                fineRepository.save(fine);

                // persist overdue fine on borrow record
                br.setOverdueFine(total);
                // optionally keep status BORROWED but you might flag record as OVERDUE in UI (if you have enum)
                borrowRecordRepository.save(br);

                // notify user
                User user = br.getUser();
                if (user != null) {
                    String subject = "Overdue Notice: " + (br.getBook() != null ? br.getBook().getTitle() : "");
                    String body = buildOverdueHtml(user, br, overdueDays, total);
                    notificationService.createAndSendEmailNotification(user, subject, body);
                }
            } else {
                // fine already exists — can optionally send periodic reminder
                // (optional) send reminder only once a week etc — omitted for brevity
            }
        }
    }

    private void notifyLowStockBooks() {
        List<Book> lowStock = bookRepository.findByAvailableCopiesLessThan(LOW_STOCK_THRESHOLD);
        if (lowStock == null || lowStock.isEmpty()) {
            log.info("No low-stock books.");
            return;
        }

        String subject = "Admin Alert: Low stock books";
        StringBuilder bodyBuilder = new StringBuilder();
        bodyBuilder.append("<p>The following books have low stock (available copies less than ")
                .append(LOW_STOCK_THRESHOLD)
                .append("):</p><ul>");

        for (Book b : lowStock) {
            bodyBuilder.append("<li>")
                    .append(b.getTitle())
                    .append(" — available: ")
                    .append(b.getAvailableCopies() == 0 ? "0" : b.getAvailableCopies())
                    .append("</li>");
        }
        bodyBuilder.append("</ul><p>Please replenish stock if necessary.</p>");

        // notify all admins / librarians
        notificationService.notifyAdmins(subject, bodyBuilder.toString());
    }

    // ------------------ small HTML builders ------------------
    private String buildUpcomingDueHtml(User user, BorrowRecord br) {
        StringBuilder s = new StringBuilder();
        s.append("<p>Hi ").append(user.getFirstName() != null ? user.getFirstName() : "Reader").append(",</p>");
        s.append("<p>This is a friendly reminder that your borrowed book ");
        s.append("<strong>").append(br.getBook() != null ? br.getBook().getTitle() : "a title").append("</strong>");
        s.append(" is due on <strong>").append(br.getDueDate()).append("</strong>.</p>");
        s.append("<p>If you need more time you can renew (subject to your plan's limits).</p>");
        s.append("<p>Thanks,<br/>Librario</p>");
        return s.toString();
    }

    private String buildOverdueHtml(User user, BorrowRecord br, long overdueDays, BigDecimal totalFine) {
        StringBuilder s = new StringBuilder();
        s.append("<p>Dear ").append(user.getFirstName() != null ? user.getFirstName() : "Reader").append(",</p>");
        s.append("<p>Your borrowed book <strong>").append(br.getBook() != null ? br.getBook().getTitle() : "a title").append("</strong> ");
        s.append("is overdue by ").append(overdueDays).append(" day").append(overdueDays > 1 ? "s" : "").append(".</p>");
        s.append("<p>Calculated fine: <strong>₹").append(totalFine).append("</strong>.</p>");
        s.append("<p>Please return the book or pay the fine to avoid further penalties.</p>");
        s.append("<p>Thanks,<br/>Librario</p>");
        return s.toString();
    }

}
