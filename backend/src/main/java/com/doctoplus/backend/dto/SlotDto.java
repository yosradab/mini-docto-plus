package com.doctoplus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlotDto {
    private String id; // optional for updates
    private String proId; // professional (doctor) id
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available = true;
}
