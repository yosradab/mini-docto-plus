package com.doctoplus.backend.controller;

import com.doctoplus.backend.model.Appointment;
import com.doctoplus.backend.model.Role;
import com.doctoplus.backend.model.Slot;
import com.doctoplus.backend.model.User;
import com.doctoplus.backend.repository.AppointmentRepository;
import com.doctoplus.backend.repository.SlotRepository;
import com.doctoplus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired private UserRepository userRepository;
    @Autowired private SlotRepository slotRepository;
    @Autowired private AppointmentRepository appointmentRepository;

    // GET /api/patients/pros
    @GetMapping("/pros")
    public ResponseEntity<?> getProfessionals() {
        List<User> pros = userRepository.findByRoleOrderByScoreDesc(Role.PRO);
        List<Map<String, Object>> result = new ArrayList<>();
        for (User pro : pros) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",        pro.getId());
            m.put("_id",       pro.getId());
            m.put("name",      pro.getName());
            m.put("email",     pro.getEmail());
            m.put("specialty", pro.getSpecialty());
            m.put("bio",       pro.getBio());
            m.put("score",     pro.getScore());
            result.add(m);
        }
        return ResponseEntity.ok(Map.of("success", true, "professionals", result));
    }

    // GET /api/patients/pros/:proId/slots
    @GetMapping("/pros/{proId}/slots")
    public ResponseEntity<?> getProSlots(@PathVariable String proId) {
        List<Slot> slots = slotRepository.findByProAndIsBookedFalse(proId);
        return ResponseEntity.ok(Map.of("success", true, "slots", slots));
    }

    // POST /api/patients/appointments
    @PostMapping("/appointments")
    public ResponseEntity<?> bookAppointment(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestBody Map<String, String> body) {
        String patientId = userDetails.getUsername();
        String slotId    = body.get("slotId");
        String notes     = body.getOrDefault("notes", "");

        if (slotId == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "slotId est obligatoire."));
        }

        Optional<Slot> optSlot = slotRepository.findById(slotId);
        if (optSlot.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Créneau introuvable."));
        }

        Slot slot = optSlot.get();
        if (slot.isBooked() || appointmentRepository.findBySlot(slotId) != null) {
            return ResponseEntity.status(409).body(Map.of("success", false, "message", "Ce créneau est déjà réservé."));
        }

        slot.setBooked(true);
        slotRepository.save(slot);

        Appointment saved = appointmentRepository.save(
                new Appointment(patientId, slot.getPro(), slotId, notes));

        return ResponseEntity.status(201).body(Map.of("success", true, "appointment", saved));
    }

    // GET /api/patients/appointments
    @GetMapping("/appointments")
    public ResponseEntity<?> getMyAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        String patientId = userDetails.getUsername();
        List<Appointment> appointments = appointmentRepository.findByPatient(patientId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment apt : appointments) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",      apt.getId());
            m.put("_id",     apt.getId());
            m.put("patient", apt.getPatient());
            m.put("notes",   apt.getNotes());
            m.put("status",  apt.getStatus());

            slotRepository.findById(apt.getSlot()).ifPresent(s -> m.put("slot", s));

            userRepository.findById(apt.getPro()).ifPresent(pro -> {
                Map<String, Object> pm = new HashMap<>();
                pm.put("id",        pro.getId());
                pm.put("_id",       pro.getId());
                pm.put("name",      pro.getName());
                pm.put("email",     pro.getEmail());
                pm.put("specialty", pro.getSpecialty());
                pm.put("bio",       pro.getBio());
                pm.put("score",     pro.getScore());
                m.put("pro", pm);
            });

            result.add(m);
        }

        return ResponseEntity.ok(Map.of("success", true, "appointments", result));
    }

    // PUT /api/patients/appointments/:id
    @PutMapping("/appointments/{id}")
    public ResponseEntity<?> updateAppointment(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        String patientId = userDetails.getUsername();

        Optional<Appointment> optApt = appointmentRepository.findById(id);
        if (optApt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Rendez-vous introuvable."));
        }

        Appointment apt = optApt.get();
        if (!apt.getPatient().equals(patientId)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Accès refusé."));
        }

        String newSlotId = body.get("newSlotId");
        String notes     = body.getOrDefault("notes", apt.getNotes());

        if (newSlotId != null && !newSlotId.equals(apt.getSlot())) {
            Optional<Slot> optNew = slotRepository.findById(newSlotId);
            if (optNew.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Nouveau créneau introuvable."));
            }
            Slot newSlot = optNew.get();
            if (newSlot.isBooked()) {
                return ResponseEntity.status(409).body(Map.of("success", false, "message", "Le nouveau créneau est déjà réservé."));
            }

            // Free old slot
            slotRepository.findById(apt.getSlot()).ifPresent(old -> {
                old.setBooked(false);
                slotRepository.save(old);
            });

            // Lock new slot
            newSlot.setBooked(true);
            slotRepository.save(newSlot);

            apt.setSlot(newSlotId);
            apt.setPro(newSlot.getPro());
        }

        apt.setNotes(notes);
        appointmentRepository.save(apt);
        return ResponseEntity.ok(Map.of("success", true, "message", "Rendez-vous modifié avec succès."));
    }

    // DELETE /api/patients/appointments/:id
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<?> cancelAppointment(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable String id) {
        String patientId = userDetails.getUsername();

        Optional<Appointment> optApt = appointmentRepository.findById(id);
        if (optApt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Rendez-vous introuvable."));
        }

        Appointment apt = optApt.get();
        if (!apt.getPatient().equals(patientId)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Accès refusé."));
        }

        slotRepository.findById(apt.getSlot()).ifPresent(slot -> {
            slot.setBooked(false);
            slotRepository.save(slot);
        });

        appointmentRepository.delete(apt);
        return ResponseEntity.ok(Map.of("success", true, "message", "Rendez-vous annulé."));
    }
}
