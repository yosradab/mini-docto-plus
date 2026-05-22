package com.doctoplus.backend.controller;

import com.doctoplus.backend.model.Appointment;
import com.doctoplus.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepo;

    // GET all appointments
    @GetMapping
    public List<Appointment> getAll() {
        return appointmentRepo.findAll();
    }

    // GET appointment by id
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getOne(@PathVariable String id) {
        return appointmentRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new appointment
    @PostMapping
    public Appointment create(@RequestBody Appointment appointment) {
        return appointmentRepo.save(appointment);
    }

    // PUT update existing appointment
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> update(@PathVariable String id,
                                               @RequestBody Appointment updated) {
        Optional<Appointment> opt = appointmentRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Appointment existing = opt.get();
        existing.setPatient(updated.getPatient());
        existing.setPro(updated.getPro());
        existing.setSlot(updated.getSlot());
        existing.setNotes(updated.getNotes());
        existing.setStatus(updated.getStatus());
        return ResponseEntity.ok(appointmentRepo.save(existing));
    }

    // DELETE appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return appointmentRepo.findById(id)
                .map(a -> {
                    appointmentRepo.delete(a);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
