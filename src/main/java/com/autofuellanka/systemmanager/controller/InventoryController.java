package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.Inventory;
import com.autofuellanka.systemmanager.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    // Get all items
    @GetMapping
    public List<Inventory> getAllItems() {
        return inventoryRepository.findAll();
    }

    // Add new item
    @PostMapping
    public Inventory addItem(@RequestBody Inventory item) {
        return inventoryRepository.save(item);
    }

    // Update item
    @PutMapping("/{id}")
    public Inventory updateItem(@PathVariable Long id, @RequestBody Inventory updatedItem) {
        return inventoryRepository.findById(id)
                .map(item -> {
                    item.setItemName(updatedItem.getItemName());
                    item.setCategory(updatedItem.getCategory());
                    item.setQuantity(updatedItem.getQuantity());
                    item.setUnitPrice(updatedItem.getUnitPrice());
                    item.setReorderLevel(updatedItem.getReorderLevel());
                    return inventoryRepository.save(item);
                })
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    // Delete item
    @DeleteMapping("/{id}")
    public String deleteItem(@PathVariable Long id) {
        inventoryRepository.deleteById(id);
        return "Item deleted with id: " + id;
    }
}
