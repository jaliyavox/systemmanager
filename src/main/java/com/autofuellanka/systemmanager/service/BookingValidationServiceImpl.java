package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.Customer;
import com.autofuellanka.systemmanager.model.Location;
import com.autofuellanka.systemmanager.model.ServiceType;
import com.autofuellanka.systemmanager.model.Vehicle;
import com.autofuellanka.systemmanager.repository.CustomerRepository;
import com.autofuellanka.systemmanager.repository.LocationRepository;
import com.autofuellanka.systemmanager.repository.ServiceTypeRepository;
import com.autofuellanka.systemmanager.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class BookingValidationServiceImpl implements BookingValidationService {

    private final CustomerRepository customers;
    private final LocationRepository locations;
    private final ServiceTypeRepository serviceTypes;
    private final VehicleRepository vehicles;

    public BookingValidationServiceImpl(
            CustomerRepository customers,
            LocationRepository locations,
            ServiceTypeRepository serviceTypes,
            VehicleRepository vehicles
    ) {
        this.customers = customers;
        this.locations = locations;
        this.serviceTypes = serviceTypes;
        this.vehicles = vehicles;
    }

    @Override
    public Customer requireCustomer(Long customerId) {
        if (customerId == null) {
            throw bad("customerId is required");
        }
        return customers.findById(customerId)
                .orElseThrow(() -> bad("Customer not found: " + customerId));
    }

    @Override
    public Location requireLocation(Long locationId) {
        if (locationId == null) {
            throw bad("locationId is required");
        }
        return locations.findById(locationId)
                .orElseThrow(() -> bad("Location not found: " + locationId));
    }

    @Override
    public ServiceType requireServiceType(Long serviceTypeId) {
        if (serviceTypeId == null) {
            throw bad("serviceTypeId is required");
        }
        return serviceTypes.findById(serviceTypeId)
                .orElseThrow(() -> bad("Service type not found: " + serviceTypeId));
    }

    @Override
    public Vehicle requireVehicleOwnedBy(Long vehicleId, Long customerId) {
        if (vehicleId == null) {
            throw bad("vehicleId is required");
        }
        if (customerId == null) {
            throw bad("customerId is required for vehicle ownership check");
        }

        Vehicle v = vehicles.findById(vehicleId)
                .orElseThrow(() -> bad("Vehicle not found: " + vehicleId));

        if (!customerId.equals(v.getCustomerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vehicle " + vehicleId + " does not belong to customer " + customerId);
        }
        return v;
    }

    @Override
    public void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start == null) throw bad("start time is required");
        if (end == null) throw bad("end time is required");
        if (!end.isAfter(start)) {
            throw bad("end time must be after start time");
        }
    }

    private ResponseStatusException bad(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
