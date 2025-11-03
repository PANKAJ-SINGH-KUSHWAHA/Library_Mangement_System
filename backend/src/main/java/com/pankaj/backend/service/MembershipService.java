package com.pankaj.backend.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pankaj.backend.entity.MembershipPlan;
import com.pankaj.backend.entity.User;
import com.pankaj.backend.repository.MembershipRepository;
import com.pankaj.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MembershipService {
    // Search plans by partial name
    public List<MembershipPlan> searchPlansByName(String name) {
        return membershipRepository.findByNameContainingIgnoreCase(name);
    }

    // Member CRUD methods
    public List<User> getAllMembers() {
        return userRepository.findAll();
    }

    public User addOrUpdateMember(User user) {
        return userRepository.save(user);
    }

    public void deleteMember(String id) {
        userRepository.deleteById(id);
    }

    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    public List<MembershipPlan> getAllPlans() {
        return membershipRepository.findAll();
    }

    public Optional<MembershipPlan> getPlanById(Integer id) {
        return membershipRepository.findById(id);
    }

    public MembershipPlan createOrUpdatePlan(MembershipPlan plan) {
        return membershipRepository.save(plan);
    }

    /**
     * Seed default plans if repository is empty.
     */
    public void seedDefaultPlans() {
        if (membershipRepository.count() > 0) return;

        MembershipPlan premium = MembershipPlan.builder()
                .id(1)
                .name("Premium")
                .monthlyFee(new BigDecimal("1500.00"))
                .borrowLimit(10)
                .maxDurationDays(30)
                .build();

        MembershipPlan standard = MembershipPlan.builder()
                .id(2)
                .name("Standard")
                .monthlyFee(new BigDecimal("800.00"))
                .borrowLimit(5)
                .maxDurationDays(30)
                .build();

        MembershipPlan free = MembershipPlan.builder()
                .id(3)
                .name("Free")
                .monthlyFee(new BigDecimal("0.00"))
                .borrowLimit(2)
                .maxDurationDays(null)
                .build();

        membershipRepository.saveAll(Arrays.asList(premium, standard, free));
    }

    /**
     * Assign a plan to a user. For Free plan membershipExpiry will be set to null.
     * For other plans, membershipExpiry is set to 1 month from now.
     */
    public Optional<User> assignPlanToUser(String userId, Integer planId) {
        Optional<User> ou = userRepository.findById(userId);
        Optional<MembershipPlan> op = membershipRepository.findById(planId);

        if (ou.isEmpty() || op.isEmpty()) return Optional.empty();

        User user = ou.get();
        MembershipPlan plan = op.get();

        user.setPlan(plan);
        user.setIsMember(true);

        if ("Free".equalsIgnoreCase(plan.getName())) {
            user.setMembershipExpiry(null);
        } else {
            // set membership expiry to 30 days from now
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, 30);
            user.setMembershipExpiry(cal.getTime());
        }

        userRepository.save(user);
        return Optional.of(user);
    }

    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }
}

