package com.pankaj.backend.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "membership_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipPlan {
    @Id
    private Integer id; // We'll allow explicit ids for seeding (1,2,3)

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "monthly_fee", nullable = false)
    private BigDecimal monthlyFee;

    /** How many books can be borrowed at once under this plan */
    @Column(name = "borrow_limit")
    private Integer borrowLimit;

    /** Maximum number of days for a borrow; nullable for unlimited/free plans */
    @Column(name = "max_duration_days")
    private Integer maxDurationDays;
}
