package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autofuellanka.systemmanager.payload.UpdatePayload;


import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerBookingController {

    private final BookingRepository bookingRepo;

    public CustomerBookingController(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    // 1) Get all bookings for a given customer
    @GetMapping("/{customerId}/bookings")
    public ResponseEntity<List<Booking>> getCustomerBookings(@PathVariable Long customerId) {
        List<Booking> bookings = bookingRepo.findByCustomerId(customerId);
        return ResponseEntity.ok(bookings);
    }

    // 2) Cancel booking (set status = "CANCELED")
    @PutMapping("/{customerId}/bookings/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long customerId, @PathVariable Long bookingId) {
        return bookingRepo.findById(bookingId).map(b -> {
            if (!b.getCustomerId().equals(customerId)) {
                return ResponseEntity.status(403).body("Forbidden: This booking does not belong to you");
            }
            b.setStatus("CANCELED");
            return ResponseEntity.ok(bookingRepo.save(b));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PutMapping("/{customerId}/bookings/{bookingId}")
    public ResponseEntity<?> updateBookingByCustomer(
            @PathVariable Long customerId,
            @PathVariable Long bookingId,
            @RequestBody(required = false) UpdatePayload payload
    ) {
        return bookingRepo.findById(bookingId).map(b -> {
            // ensure this booking belongs to the customer
            if (b.getCustomerId() == null || !b.getCustomerId().equals(customerId)) {
                return ResponseEntity.status(403).body("Forbidden: This booking does not belong to you");
            }

            // handle empty body (payload == null) gracefully
            if (payload == null) {
                return ResponseEntity.badRequest().body("Request body is empty. Send at least one field or {}.");
            }

            // apply allowed changes (ignore status & customerId)
            if (payload.startTime != null && !payload.startTime.isBlank()) b.setStartTime(payload.startTime);
            if (payload.endTime != null && !payload.endTime.isBlank())     b.setEndTime(payload.endTime);
            if (payload.type != null && !payload.type.isBlank())           b.setType(payload.type);
            if (payload.fuelType != null && !payload.fuelType.isBlank())   b.setFuelType(payload.fuelType);
            if (payload.litersRequested != null)                           b.setLitersRequested(payload.litersRequested);
            if (payload.locationId != null)                                 b.setLocationId(payload.locationId);
            if (payload.serviceTypeId != null)                              b.setServiceTypeId(payload.serviceTypeId);
            if (payload.vehicleId != null)                                  b.setVehicleId(payload.vehicleId);

            try {
                Booking saved = bookingRepo.save(b);
                return ResponseEntity.ok(saved);
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                String msg = ex.getMostSpecificCause() != null
                        ? ex.getMostSpecificCause().getMessage()
                        : ex.getMessage();
                return ResponseEntity.badRequest().body("DB constraint error: " + msg);
            } catch (Exception ex) {
                return ResponseEntity.internalServerError().body("Server error: " + ex.getMessage());
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }


}
