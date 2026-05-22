package com.doctoplus.backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    PRO,
    PATIENT;

    @JsonCreator
    public static Role from(String value) {
        if (value == null) return null;
        return Role.valueOf(value.trim().toUpperCase());
    }

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
