package com.pankaj.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling   // ✅ REQUIRED FOR @Scheduled TO WORK
public class BackendApplication {

    public static void main(String[] args) {
        // Load .env and propagate values into system properties (only if not already set).
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();

            propagateIfAbsent(dotenv, "DB_URL");
            propagateIfAbsent(dotenv, "DB_USERNAME");
            propagateIfAbsent(dotenv, "DB_PASSWORD");
            propagateIfAbsent(dotenv, "APP_JWT_SECRET");
            propagateIfAbsent(dotenv, "SPRING_MAIL_HOST");
            propagateIfAbsent(dotenv, "SPRING_MAIL_PORT");
            propagateIfAbsent(dotenv, "SPRING_MAIL_USERNAME");
            propagateIfAbsent(dotenv, "SPRING_MAIL_PASSWORD");
            propagateIfAbsent(dotenv, "SPRING_MAIL_SMTP_AUTH");
            propagateIfAbsent(dotenv, "SPRING_MAIL_STARTTLS");
        } catch (Throwable t) {
            System.err.println("Warning: failed to load .env: " + t.getMessage());
        }

        SpringApplication.run(BackendApplication.class, args);
    }

    private static void propagateIfAbsent(Dotenv dotenv, String key) {
        try {
            if (System.getProperty(key) != null) return;
            if (System.getenv(key) != null) return;

            String val = dotenv.get(key);
            if (val != null && !val.isBlank())
                System.setProperty(key, val);
        }
        catch (Exception ignored) {}
    }
}
