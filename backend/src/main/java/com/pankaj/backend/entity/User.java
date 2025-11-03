package com.pankaj.backend.entity;

import java.time.LocalDateTime;
import java.util.Date;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    private Boolean active = true;
    private Date joinDate = new Date();
    private Date createdAt = new Date();

    @Column(nullable = false)
    private boolean enabled = false;

    @Column
    private String verificationCode;

    @Column
    private String resetOtp;

    @Column
    private LocalDateTime otpExpiry;

    // Membership relation: refers to membership_plans.plan_id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id")
    private MembershipPlan plan;

    @Column(name = "membership_expiry")
    private Date membershipExpiry;

    @Column(name = "is_member")
    @Builder.Default
    private Boolean isMember = true;

    // Contact details
    private String phone;

    @Column(columnDefinition = "text")
    private String address;

}
