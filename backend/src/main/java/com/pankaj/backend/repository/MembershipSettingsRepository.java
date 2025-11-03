package com.pankaj.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pankaj.backend.entity.MembershipSettings;

@Repository
public interface MembershipSettingsRepository extends JpaRepository<MembershipSettings, Integer> {

}
