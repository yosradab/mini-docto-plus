package com.doctoplus.backend.controller;

import com.doctoplus.backend.model.User;
import com.doctoplus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepo;

    // GET all users
    @GetMapping
    public List<User> getAll() {
        return userRepo.findAll();
    }

    // GET user by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getOne(@PathVariable String id) {
        return userRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new user (admin use‑case)
    @PostMapping
    public User create(@RequestBody User user) {
        return userRepo.save(user);
    }

    // PUT update existing user
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable String id,
                                       @RequestBody User updated) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User existing = opt.get();
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPassword(updated.getPassword());
        existing.setRole(updated.getRole());
        existing.setSpecialty(updated.getSpecialty());
        existing.setBio(updated.getBio());
        existing.setScore(updated.getScore());
        return ResponseEntity.ok(userRepo.save(existing));
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return userRepo.findById(id)
                .map(u -> {
                    userRepo.delete(u);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
