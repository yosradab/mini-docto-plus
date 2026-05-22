package com.doctoplus.backend.controller;

import com.doctoplus.backend.model.Slot;
import com.doctoplus.backend.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    @Autowired
    private SlotRepository slotRepo;

    // GET all slots
    @GetMapping
    public List<Slot> getAll() {
        return slotRepo.findAll();
    }

    // GET slot by id
    @GetMapping("/{id}")
    public ResponseEntity<Slot> getOne(@PathVariable String id) {
        return slotRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new slot
    @PostMapping
    public Slot create(@RequestBody Slot slot) {
        return slotRepo.save(slot);
    }

    // PUT update existing slot
    @PutMapping("/{id}")
    public ResponseEntity<Slot> update(@PathVariable String id, @RequestBody Slot updated) {
        Optional<Slot> opt = slotRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Slot existing = opt.get();
        existing.setPro(updated.getPro());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setBooked(updated.isBooked());
        return ResponseEntity.ok(slotRepo.save(existing));
    }

    // DELETE slot
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return slotRepo.findById(id)
                .map(s -> {
                    slotRepo.delete(s);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
