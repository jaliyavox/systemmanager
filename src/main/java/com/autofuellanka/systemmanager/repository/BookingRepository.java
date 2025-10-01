package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);

    Optional<Booking> findByIdAndCustomerId(Long id, Long customerId);

    @Query("select b from Booking b left join fetch b.serviceType where b.customerId = :customerId")
    List<Booking> findByCustomerIdWithServiceType(@Param("customerId") Long customerId);

    @Query("select b from Booking b left join fetch b.serviceType")
    List<Booking> findAllWithServiceType();

    @Query("select b from Booking b left join fetch b.serviceType where b.id = :id")
    Optional<Booking> findByIdWithServiceType(@Param("id") Long id);
}
