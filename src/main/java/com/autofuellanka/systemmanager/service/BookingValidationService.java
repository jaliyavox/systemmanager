package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.Vehicle;
import com.autofuellanka.systemmanager.repository.LocationRepository;
import com.autofuellanka.systemmanager.repository.ServiceTypeRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import com.autofuellanka.systemmanager.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class BookingValidationService {

    // Allowed values we’ll accept (DB can still be freer/tighter if you want)
    private static final Set<String> ALLOWED_TYPES   = Set.of("FUEL", "SERVICE");
    private static final Set<String> ALLOWED_STATUS  = Set.of("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED");
    private static final Set<String> ALLOWED_FUEL    = Set.of("PETROL", "DIESEL", "ELECTRIC", "HYBRID");

    private final UserRepository userRepo;
    private final LocationRepository locationRepo;
    private final ServiceTypeRepository serviceTypeRepo;
    private final VehicleRepository vehicleRepo;

    public BookingValidationService(UserRepository userRepo,
                                    LocationRepository locationRepo,
                                    ServiceTypeRepository serviceTypeRepo,
                                    VehicleRepository vehicleRepo) {
        this.userRepo = userRepo;
        this.locationRepo = locationRepo;
        this.serviceTypeRepo = serviceTypeRepo;
        this.vehicleRepo = vehicleRepo;
    }

    /** Normalize simple string enums to UPPERCASE; null-safe */
    private String up(String s) { return (s == null ? null : s.trim().toUpperCase()); }

    /**
     * Validate a booking “create/update” request.
     * Return null if OK; otherwise a human-readable error string you can send back as 400.
     *
     * @param customerId     required
     * @param locationId     required
     * @param serviceTypeId  optional for FUEL, required for SERVICE
     * @param vehicleId      optional, but if present must belong to the same customer
     * @param type           required (FUEL | SERVICE)
     * @param status         optional on create (defaults to PENDING), but if present must be valid
     * @param fuelType       required only for FUEL bookings if litersRequested is set
     * @param litersRequested optional (if FUEL booking and provided, must be > 0)
     */
    public String validateCreateOrUpdate(Long customerId,
                                         Long locationId,
                                         Long serviceTypeId,
                                         Long vehicleId,
                                         String type,
                                         String status,
                                         String fuelType,
                                         Double litersRequested) {

        // Required IDs
        if (customerId == null) return "customerId is required";
        if (locationId == null) return "locationId is required";

        // Existence checks
        if (!userRepo.existsById(customerId)) {
            return "customerId does not exist";
        }
        if (!locationRepo.existsById(locationId)) {
            return "locationId does not exist";
        }

        // Type / Status normalization + validation
        String t = up(type);
        if (t == null || t.isBlank()) return "type is required (FUEL or SERVICE)";
        if (!ALLOWED_TYPES.contains(t)) return "type must be one of: " + ALLOWED_TYPES;

        String st = up(status);
        if (st != null && !st.isBlank() && !ALLOWED_STATUS.contains(st)) {
            return "status must be one of: " + ALLOWED_STATUS;
        }

        // Vehicle ownership (if provided)
        if (vehicleId != null) {
            Vehicle v = vehicleRepo.findById(vehicleId).orElse(null);
            if (v == null) return "vehicleId does not exist";
            if (!customerId.equals(v.getCustomerId())) {
                return "vehicle does not belong to the given customer";
            }
        }

        // ServiceType rule: required for SERVICE, optional for FUEL
        if ("SERVICE".equals(t)) {
            if (serviceTypeId == null) return "serviceTypeId is required for SERVICE bookings";
            if (!serviceTypeRepo.existsById(serviceTypeId)) {
                return "serviceTypeId does not exist";
            }
        } else { // FUEL
            // Fuel-specific validations (optional but nice)
            String ft = up(fuelType);
            if (litersRequested != null) {
                if (litersRequested <= 0) return "litersRequested must be > 0";
                if (ft == null || ft.isBlank()) return "fuelType is required when litersRequested is provided";
                if (!ALLOWED_FUEL.contains(ft)) return "fuelType must be one of: " + ALLOWED_FUEL;
            }
        }

        // Passed all checks
        return null;
    }

    /** Utility to normalize fields on the way in (optional) */
    public Normalized normalize(String type, String status, String fuelType) {
        Normalized n = new Normalized();
        n.type = up(type);
        n.status = up(status);
        n.fuelType = up(fuelType);
        return n;
    }

    public static class Normalized {
        public String type;
        public String status;
        public String fuelType;
    }
}
