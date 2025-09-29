package com.autofuellanka.systemmanager.controller;

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
}
