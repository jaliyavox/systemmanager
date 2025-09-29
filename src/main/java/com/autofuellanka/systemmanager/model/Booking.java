package com.autofuellanka.systemmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Keep as String for now (simple handling)
    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "liters_requested")
    private Double litersRequested;

    @Column(name = "status")
    private String status;

    @Column(name = "type")
    private String type;

    // ---- Foreign keys (primitive) ----
    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "service_type_id")
    private Long serviceTypeId;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    // ---- Read-only relationship (ignored in JSON to avoid lazy-load issues) ----
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Customer customer;

    // --- Getters & setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public Double getLitersRequested() { return litersRequested; }
    public void setLitersRequested(Double litersRequested) { this.litersRequested = litersRequested; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public Long getServiceTypeId() { return serviceTypeId; }
    public void setServiceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
}
