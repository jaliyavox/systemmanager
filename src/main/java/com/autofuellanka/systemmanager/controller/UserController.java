package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;


import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // --- REGISTER ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User payload) {
        if (payload.getEmail() == null || payload.getEmail().isBlank()
                || payload.getFullName() == null || payload.getFullName().isBlank()
                || payload.getPassword() == null || payload.getPassword().isBlank()
                || payload.getPhone() == null || payload.getPhone().isBlank()) {
            return ResponseEntity.badRequest().body("fullName, email, password, phone are required");
        }
        if (userRepository.findByEmail(payload.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        // defaults
        if (payload.getRole() == null || payload.getRole().isBlank()) {
            payload.setRole("CUSTOMER");
        }
        payload.setEnabled(true);

        User saved = userRepository.save(payload);
        // hide password in the response (belt & suspenders)
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    // --- LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User payload) {
        if (payload.getEmail() == null || payload.getEmail().isBlank()
                || payload.getPassword() == null || payload.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("email and password are required");
        }

        return userRepository.findByEmail(payload.getEmail())
                .map(u -> {
                    if (u.getPassword().equals(payload.getPassword())) {
                        u.setPassword(null); // don't echo it back
                        return ResponseEntity.ok(u);
                    } else {
                        return ResponseEntity.status(401).body("Invalid credentials");
                    }
                })
                .orElseGet(() -> ResponseEntity.status(401).body("Invalid credentials"));
    }

    // --- LIST (sanity check that controller is mapped) ---
    @GetMapping
    public List<User> findAll() {
        List<User> all = userRepository.findAll();
        // hide passwords if any
        all.forEach(u -> u.setPassword(null));
        return all;
    }
    @PutMapping(path = "/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User updates) {
        return userRepository.findById(id)
                .map(user -> {
                    if (updates.getFullName() != null && !updates.getFullName().isBlank())
                        user.setFullName(updates.getFullName());
                    if (updates.getPhone() != null && !updates.getPhone().isBlank())
                        user.setPhone(updates.getPhone());
                    if (updates.getAddress() != null && !updates.getAddress().isBlank())
                        user.setAddress(updates.getAddress());
                    if (updates.getRole() != null && !updates.getRole().isBlank())
                        user.setRole(updates.getRole());

                    User saved = userRepository.save(user);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
