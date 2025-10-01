package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingCreateRequest;
import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.service.BookingValidationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers/{customerId}/bookings")
public class CustomerBookingController {

    private final BookingRepository bookingRepo;
    private final BookingValidationService validator;

    public CustomerBookingController(BookingRepository bookingRepo,
                                     BookingValidationService validator) {
        this.bookingRepo = bookingRepo;
        this.validator = validator;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @PathVariable Long customerId,
            @Valid @RequestBody BookingCreateRequest req
    ) {
        // --- validations ---
        validator.requireCustomer(customerId);
        validator.requireLocation(req.getLocationId());
        if (req.getServiceTypeId() != null) {
            validator.requireServiceType(req.getServiceTypeId());
        }
        validator.requireVehicleOwnedBy(req.getVehicleId(), customerId);

        // --- map request → entity ---
        Booking booking = new Booking();
        booking.setCustomerId(customerId);
        booking.setLocationId(req.getLocationId());
        booking.setServiceTypeId(req.getServiceTypeId());
        booking.setVehicleId(req.getVehicleId());

        booking.setType(req.getType());
        booking.setFuelType(req.getFuelType());
        booking.setLitersRequested(req.getLitersRequested());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());

        // default safe status
        booking.setStatus("PENDING");

        // --- save ---
        Booking saved = bookingRepo.save(booking);

        // --- response ---
        return ResponseEntity.status(201).body(new BookingDTO(saved));
    }
}
