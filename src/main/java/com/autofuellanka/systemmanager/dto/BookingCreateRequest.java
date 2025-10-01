package com.autofuellanka.systemmanager.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BookingCreateRequest {

    private String startTime;
    private String endTime;
    private String fuelType;
    private Double litersRequested;

    @NotNull
    private Long locationId;

    private Long serviceTypeId; // optional for fuel bookings

    @NotNull
    private Long vehicleId;

    @Size(min = 1, max = 32)
    private String type;  // "SERVICE" or "FUEL"

    // --- getters/setters ---
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public Double getLitersRequested() { return litersRequested; }
    public void setLitersRequested(Double litersRequested) { this.litersRequested = litersRequested; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public Long getServiceTypeId() { return serviceTypeId; }
    public void setServiceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
