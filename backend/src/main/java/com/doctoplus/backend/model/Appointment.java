package com.doctoplus.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
public class Appointment {
    @Id
    private String id;
    
    private String patient; // Patient ID
    private String pro; // Professional ID
    
    @Indexed(unique = true)
    private String slot; // Slot ID
    
    private String notes;
    private String status = "confirmed"; // "confirmed" or "cancelled"

    public Appointment() {}

    public Appointment(String patient, String pro, String slot, String notes) {
        this.patient = patient;
        this.pro = pro;
        this.slot = slot;
        this.notes = notes;
        this.status = "confirmed";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatient() { return patient; }
    public void setPatient(String patient) { this.patient = patient; }

    public String getPro() { return pro; }
    public void setPro(String pro) { this.pro = pro; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
