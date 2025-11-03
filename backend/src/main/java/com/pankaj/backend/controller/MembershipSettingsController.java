package com.pankaj.backend.controller;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pankaj.backend.entity.MembershipSettings;
import com.pankaj.backend.repository.MembershipSettingsRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/memberships/settings")
@RequiredArgsConstructor
public class MembershipSettingsController {

    private final MembershipSettingsRepository repo;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<MembershipSettings> getSettings() {
        var settings = repo.findById(1).orElse(new MembershipSettings(1, BigDecimal.ZERO));
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateSettings(@RequestBody MembershipSettings in) {
        var s = repo.findById(1).orElse(new MembershipSettings(1, BigDecimal.ZERO));
        s.setFinePerDay(in.getFinePerDay() == null ? BigDecimal.ZERO : in.getFinePerDay());
        repo.save(s);
        return ResponseEntity.ok(s);
    }
}
