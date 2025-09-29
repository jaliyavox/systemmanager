package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerBookingController {

    private final BookingRepository bookingRepo;

    public CustomerBookingController(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    // List bookings for a customer (FETCH JOIN -> serviceType loaded)
    @GetMapping("/{customerId}/bookings")
    public ResponseEntity<?> listBookingsByCustomer(@PathVariable Long customerId) {
        List<Booking> bookings = bookingRepo.findByCustomerIdWithServiceType(customerId);
        return ResponseEntity.ok(bookings.stream().map(BookingDTO::new).toList());
    }

    // Cancel a booking
    @PutMapping("/{customerId}/bookings/{bookingId}/cancel")
    public ResponseEntity<?> cancelBookingByCustomer(
            @PathVariable Long customerId,
            @PathVariable Long bookingId
    ) {
        return bookingRepo.findById(bookingId).map(b -> {
            if (!b.getCustomerId().equals(customerId)) {
                return ResponseEntity.status(403).body("Forbidden: This booking does not belong to you");
            }
            b.setStatus("CANCELLED");
            Booking saved = bookingRepo.save(b);
            // Reload with fetch join for DTO
            Booking full = bookingRepo.findByIdWithServiceType(saved.getId()).orElse(saved);
            return ResponseEntity.ok(new BookingDTO(full));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update booking (reschedule/change details)
    @PutMapping("/{customerId}/bookings/{bookingId}")
    public ResponseEntity<?> updateBookingByCustomer(
            @PathVariable Long customerId,
            @PathVariable Long bookingId,
            @RequestBody(required = false) UpdatePayload payload
    ) {
        return bookingRepo.findById(bookingId).map(b -> {
            if (!b.getCustomerId().equals(customerId)) {
                return ResponseEntity.status(403).body("Forbidden: This booking does not belong to you");
            }
            if (payload == null) {
                return ResponseEntity.badRequest().body("Request body is empty. Send at least one field or {}.");
            }

            if (payload.startTime != null && !payload.startTime.isBlank()) b.setStartTime(payload.startTime);
            if (payload.endTime != null && !payload.endTime.isBlank())     b.setEndTime(payload.endTime);
            if (payload.type != null && !payload.type.isBlank())           b.setType(payload.type);
            if (payload.fuelType != null && !payload.fuelType.isBlank())   b.setFuelType(payload.fuelType);
            if (payload.litersRequested != null)                           b.setLitersRequested(payload.litersRequested);
            if (payload.locationId != null)                                b.setLocationId(payload.locationId);
            if (payload.serviceTypeId != null)                             b.setServiceTypeId(payload.serviceTypeId);
            if (payload.vehicleId != null)                                 b.setVehicleId(payload.vehicleId);

            Booking saved = bookingRepo.save(b);
            // Reload with fetch join for DTO
            Booking full = bookingRepo.findByIdWithServiceType(saved.getId()).orElse(saved);
            return ResponseEntity.ok(new BookingDTO(full));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- DTO for updates ---
    public static class UpdatePayload {
        public String startTime;
        public String endTime;
        public String type;
        public String fuelType;
        public Double litersRequested;
        public Long locationId;
        public Long serviceTypeId;
        public Long vehicleId;
    }
}
