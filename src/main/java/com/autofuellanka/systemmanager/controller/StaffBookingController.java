package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff/bookings")
public class StaffBookingController {

    private final BookingRepository repo;
    private final UserRepository userRepo;

    public StaffBookingController(BookingRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    private boolean isStaffRole(String role) {
        return role != null && (role.equalsIgnoreCase("STAFF") || role.equalsIgnoreCase("ADMIN"));
    }

    /** Resolve role: prefer X-Role header; if absent, try X-User-Id -> lookup user.role */
    private String resolveRole(String roleHeader, Long userIdHeader) {
        if (roleHeader != null && !roleHeader.isBlank()) return roleHeader;
        if (userIdHeader != null) {
            Optional<User> u = userRepo.findById(userIdHeader);
            return u.map(User::getRole).orElse(null);
        }
        return null;
    }

    // 1) Staff - list all bookings
    @GetMapping
    public ResponseEntity<?> listAll(
            @RequestHeader(value = "X-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader
    ) {
        String role = resolveRole(roleHeader, userIdHeader);
        System.out.println("DEBUG(listAll): X-Role=" + roleHeader + " X-User-Id=" + userIdHeader + " -> resolvedRole=" + role);
        if (!isStaffRole(role)) return ResponseEntity.status(403).body("Forbidden: STAFF/ADMIN only");
        List<Booking> all = repo.findAll();
        return ResponseEntity.ok(all);
    }

    // 2) Staff - update booking status only
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "X-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader,
            @PathVariable Long id,
            @RequestBody StatusPayload payload
    ) {
        String role = resolveRole(roleHeader, userIdHeader);
        System.out.println("DEBUG(updateStatus): X-Role=" + roleHeader + " X-User-Id=" + userIdHeader + " -> resolvedRole=" + role);
        if (!isStaffRole(role)) return ResponseEntity.status(403).body("Forbidden: STAFF/ADMIN only");
        if (payload == null || payload.status == null || payload.status.isBlank()) {
            return ResponseEntity.badRequest().body("status is required");
        }

        return repo.findById(id).map(b -> {
            b.setStatus(payload.status);
            Booking saved = repo.save(b);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // tiny inner DTO
    public static class StatusPayload {
        public String status;
    }
}
