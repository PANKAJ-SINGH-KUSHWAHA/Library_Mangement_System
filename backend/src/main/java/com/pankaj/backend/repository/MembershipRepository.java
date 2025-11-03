package com.pankaj.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pankaj.backend.entity.MembershipPlan;

@Repository
public interface MembershipRepository extends JpaRepository<MembershipPlan, Integer> {
    Optional<MembershipPlan> findByName(String name);
}

