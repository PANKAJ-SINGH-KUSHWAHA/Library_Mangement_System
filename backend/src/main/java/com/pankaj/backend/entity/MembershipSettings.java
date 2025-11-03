package com.pankaj.backend.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "membership_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembershipSettings {
    @Id
    private Integer id = 1; // singleton row

    @Column(name = "fine_per_day")
    private BigDecimal finePerDay = BigDecimal.ZERO;
}
