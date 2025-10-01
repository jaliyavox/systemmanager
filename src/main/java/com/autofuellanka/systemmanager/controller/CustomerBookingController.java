package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingCreateRequest;
import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.service.BookingValidationService;
// Swagger annotations will be added once dependencies are resolved
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
        // --- existence & ownership validations ---
        validator.requireCustomer(customerId);
        validator.requireLocation(req.getLocationId());
        if (req.getServiceTypeId() != null) {
            validator.requireServiceType(req.getServiceTypeId());
        }
        validator.requireVehicleOwnedBy(req.getVehicleId(), customerId);

        // --- time validation (ISO-8601 + end after start) ---
        try {
            java.time.LocalDateTime start = java.time.LocalDateTime.parse(req.getStartTime());
            java.time.LocalDateTime end   = java.time.LocalDateTime.parse(req.getEndTime());
            if (!end.isAfter(start)) {
                throw new IllegalArgumentException("endTime must be after startTime");
            }
        } catch (java.time.format.DateTimeParseException e) {
            throw new IllegalArgumentException("startTime/endTime must be ISO-8601, e.g., 2025-10-02T09:00:00");
        }

        // --- normalize incoming strings to UPPERCASE (null-safe) ---
        var norm = validator.normalize(req.getType(), req.getStatus(), req.getFuelType());

        // --- business validation (type/status/fuel/liters rules) ---
        String err = validator.validateCreateOrUpdate(
                customerId,
                req.getLocationId(),
                req.getServiceTypeId(),
                req.getVehicleId(),
                norm.type,            // normalized TYPE
                norm.status,          // normalized STATUS (may be null)
                norm.fuelType,        // normalized FUEL
                req.getLitersRequested()
        );
        if (err != null) {
            throw new IllegalArgumentException(err);
        }

        // --- map request → entity ---
        Booking booking = new Booking();
        booking.setCustomerId(customerId);
        booking.setLocationId(req.getLocationId());
        booking.setVehicleId(req.getVehicleId());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());

        // Type-specific mapping & field cleanup
        if ("SERVICE".equals(norm.type)) {
            booking.setType("SERVICE");
            booking.setServiceTypeId(req.getServiceTypeId());

            // clear fuel-only fields
            booking.setFuelType(null);
            booking.setLitersRequested(null);
        } else if ("FUEL".equals(norm.type)) {
            booking.setType("FUEL");
            booking.setFuelType(norm.fuelType);
            booking.setLitersRequested(req.getLitersRequested());

            // clear service-only fields
            booking.setServiceTypeId(null);
        } else {
            // Shouldn't happen due to validation, but guard anyway
            throw new IllegalArgumentException("type must be SERVICE or FUEL");
        }

        // default safe status if client didn't provide one (use normalized)
        booking.setStatus(norm.status != null ? norm.status : "PENDING");

        // --- save ---
        Booking saved = bookingRepo.save(booking);

        // --- response ---
        return ResponseEntity.status(201).body(new BookingDTO(saved));
    }

    @GetMapping
    public ResponseEntity<?> listBookings(@PathVariable Long customerId) {
        // validate customer exists
        validator.requireCustomer(customerId);

        var bookings = bookingRepo.findByCustomerId(customerId);
        var dtos = bookings.stream().map(BookingDTO::new).toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
            @PathVariable Long customerId,
            @PathVariable Long id
    ) {
        validator.requireCustomer(customerId);
        return bookingRepo.findByIdAndCustomerId(id, customerId)
                .map(BookingDTO::new)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long customerId,
            @PathVariable Long id,
            @RequestBody com.autofuellanka.systemmanager.payload.UpdatePayload updates
    ) {
        validator.requireCustomer(customerId);

        return bookingRepo.findByIdAndCustomerId(id, customerId)
                .map(existing -> {
                    // Normalize incoming enums
                    var norm = validator.normalize(updates.type, updates == null ? null : null, updates.fuelType);

                    // Business validation for changed fields (reuse validate method with current+updates)
                    String err = validator.validateCreateOrUpdate(
                            customerId,
                            updates.locationId != null ? updates.locationId : existing.getLocationId(),
                            updates.serviceTypeId != null ? updates.serviceTypeId : existing.getServiceTypeId(),
                            updates.vehicleId != null ? updates.vehicleId : existing.getVehicleId(),
                            norm.type != null ? norm.type : existing.getType(),
                            existing.getStatus(), // status checked separately via transition rules
                            norm.fuelType != null ? norm.fuelType : existing.getFuelType(),
                            updates.litersRequested != null ? updates.litersRequested : existing.getLitersRequested()
                    );
                    if (err != null) throw new IllegalArgumentException(err);

                    // Apply simple field updates
                    if (updates.startTime != null) existing.setStartTime(updates.startTime);
                    if (updates.endTime != null) existing.setEndTime(updates.endTime);
                    if (norm.type != null) existing.setType(norm.type);
                    if (updates.locationId != null) existing.setLocationId(updates.locationId);
                    if (updates.vehicleId != null) existing.setVehicleId(updates.vehicleId);
                    if (norm.fuelType != null) existing.setFuelType(norm.fuelType);
                    if (updates.litersRequested != null) existing.setLitersRequested(updates.litersRequested);
                    if (updates.serviceTypeId != null) existing.setServiceTypeId(updates.serviceTypeId);

                    // Status transition enforcement
                    if (updates.type != null && norm.type != null) {
                        // when switching type, clear irrelevant fields
                        if ("SERVICE".equals(norm.type)) {
                            existing.setFuelType(null);
                            existing.setLitersRequested(null);
                        } else if ("FUEL".equals(norm.type)) {
                            existing.setServiceTypeId(null);
                        }
                    }

                    // If a status field were present in UpdatePayload, we'd validate transitions here
                    // using validator.validateStatusTransition(existing.getStatus(), updates.status)

                    Booking saved = bookingRepo.save(existing);
                    return ResponseEntity.ok(new BookingDTO(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(
            @PathVariable Long customerId,
            @PathVariable Long id
    ) {
        validator.requireCustomer(customerId);

        return bookingRepo.findByIdAndCustomerId(id, customerId)
                .map(existing -> {
                    String err = validator.validateStatusTransition(existing.getStatus(), "CANCELLED");
                    if (err != null) throw new IllegalArgumentException(err);
                    existing.setStatus("CANCELLED");
                    Booking saved = bookingRepo.save(existing);
                    return ResponseEntity.ok(new BookingDTO(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long customerId,
            @PathVariable Long id,
            @RequestBody com.autofuellanka.systemmanager.payload.StatusUpdatePayload payload
    ) {
        validator.requireCustomer(customerId);

        return bookingRepo.findByIdAndCustomerId(id, customerId)
                .map(existing -> {
                    String err = validator.validateStatusTransition(existing.getStatus(), payload.status);
                    if (err != null) throw new IllegalArgumentException(err);
                    existing.setStatus(payload.status.toUpperCase());
                    Booking saved = bookingRepo.save(existing);
                    return ResponseEntity.ok(new BookingDTO(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

