package com.doctoplus.backend.dto;

public class RegisterDto {
    private String name;
    private String email;
    private String password;
    private String role; // "patient" or "pro"
    private String specialty; // only for pros
    private String bio; // only for pros
    private Integer score; // only for pros (0-100)

    public RegisterDto() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}
