package com.doctoplus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDto {
    private String id; // optional for updates
    private String patientId;
    private String proId;
    private String slotId;
    private String notes;
}
