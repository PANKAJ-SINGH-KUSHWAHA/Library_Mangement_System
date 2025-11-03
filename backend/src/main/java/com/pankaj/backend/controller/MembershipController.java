package com.pankaj.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pankaj.backend.entity.MembershipPlan;
import com.pankaj.backend.service.MembershipService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {

	private final MembershipService membershipService;

	@GetMapping("/plans")
	public ResponseEntity<List<MembershipPlan>> getPlans() {
		return ResponseEntity.ok(membershipService.getAllPlans());
	}

	@PostMapping("/assign")
	public ResponseEntity<?> assignPlan(@RequestBody AssignPlanRequest req) {
		var opt = membershipService.assignPlanToUser(req.getUserId(), req.getPlanId());
		if (opt.isPresent()) return ResponseEntity.ok(opt.get());
		return ResponseEntity.badRequest().body("User or Plan not found");
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<?> getUserPlan(@PathVariable String userId) {
		return membershipService.getUserById(userId)
				.map(u -> ResponseEntity.ok(u))
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	// DTO for assign request
	public static class AssignPlanRequest {
		private String userId;
		private Integer planId;

		public String getUserId() { return userId; }
		public void setUserId(String userId) { this.userId = userId; }
		public Integer getPlanId() { return planId; }
		public void setPlanId(Integer planId) { this.planId = planId; }
	}
}
