package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
}
