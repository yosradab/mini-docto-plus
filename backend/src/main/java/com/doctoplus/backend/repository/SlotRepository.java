package com.doctoplus.backend.repository;

import com.doctoplus.backend.model.Slot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SlotRepository extends MongoRepository<Slot, String> {
    List<Slot> findByProfessionalId(String professionalId);
    List<Slot> findByProfessionalIdAndIsBookedFalse(String professionalId);
}
