package com.doctoplus.backend.dto;

import com.doctoplus.backend.model.Role;

public class AuthResponse {
    private String token;
    private Role role;
    private String name;
    private String refreshToken;

    public AuthResponse() {}

    public AuthResponse(String token) {
        this.token = token;
    }

    public AuthResponse(String token, Role role, String name) {
        this.token = token;
        this.role = role;
        this.name = name;
    }

    public AuthResponse(String token, Role role, String name, String refreshToken) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.refreshToken = refreshToken;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
