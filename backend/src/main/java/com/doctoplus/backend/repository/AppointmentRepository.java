package com.doctoplus.backend.repository;

import com.doctoplus.backend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatient(String patientId);
    List<Appointment> findByPro(String proId);
    Appointment findBySlot(String slotId);
}
