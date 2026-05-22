package com.doctoplus.backend.controller;

import com.doctoplus.backend.model.Appointment;
import com.doctoplus.backend.model.Slot;
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
@RequestMapping("/api/pros")
@CrossOrigin(origins = "*")
public class ProController {

    @Autowired private SlotRepository slotRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private UserRepository userRepository;

    // GET /api/pros/slots
    @GetMapping("/slots")
    public ResponseEntity<?> getMySlots(@AuthenticationPrincipal UserDetails userDetails) {
        String proId = userDetails.getUsername();
        List<Slot> slots = slotRepository.findByPro(proId);
        return ResponseEntity.ok(Map.of("success", true, "slots", slots));
    }

    // POST /api/pros/slots
    @PostMapping("/slots")
    public ResponseEntity<?> createSlot(@AuthenticationPrincipal UserDetails userDetails,
                                         @RequestBody Map<String, String> body) {
        String proId     = userDetails.getUsername();
        String date      = body.get("date");
        String startTime = body.get("startTime");
        String endTime   = body.get("endTime");

        if (date == null || startTime == null || endTime == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Date, heure de début et heure de fin sont requis."));
        }

        Slot saved = slotRepository.save(new Slot(proId, date, startTime, endTime));
        return ResponseEntity.status(201).body(Map.of("success", true, "slot", saved));
    }

    // DELETE /api/pros/slots/:id
    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable String id) {
        String proId = userDetails.getUsername();

        Optional<Slot> optSlot = slotRepository.findById(id);
        if (optSlot.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Créneau introuvable."));
        }

        Slot slot = optSlot.get();
        if (!slot.getPro().equals(proId)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Accès refusé."));
        }

        // Cascade-delete any linked appointment
        Appointment linked = appointmentRepository.findBySlot(id);
        if (linked != null) appointmentRepository.delete(linked);

        slotRepository.delete(slot);
        return ResponseEntity.ok(Map.of("success", true, "message", "Créneau supprimé."));
    }

    // GET /api/pros/appointments
    @GetMapping("/appointments")
    public ResponseEntity<?> getMyAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        String proId = userDetails.getUsername();
        List<Appointment> appointments = appointmentRepository.findByPro(proId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment apt : appointments) {
            Map<String, Object> m = new HashMap<>();
            m.put("_id",    apt.getId());
            m.put("notes",  apt.getNotes());
            m.put("status", apt.getStatus());

            slotRepository.findById(apt.getSlot()).ifPresent(s -> m.put("slot", s));

            userRepository.findById(apt.getPatient()).ifPresent(patient -> {
                Map<String, Object> p = new HashMap<>();
                p.put("id",    patient.getId());
                p.put("name",  patient.getName());
                p.put("email", patient.getEmail());
                m.put("patient", p);
            });

            result.add(m);
        }

        return ResponseEntity.ok(Map.of("success", true, "appointments", result));
    }
}
