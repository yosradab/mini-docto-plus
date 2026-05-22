package com.doctoplus.backend.controller;

import com.doctoplus.backend.dto.RegisterDto;
import com.doctoplus.backend.model.User;
import com.doctoplus.backend.repository.UserRepository;
import com.doctoplus.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import com.doctoplus.backend.model.Role;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto dto) {

        if (dto.getEmail() == null || dto.getPassword() == null || dto.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Nom, email et mot de passe sont obligatoires."
            ));
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cet email est déjà utilisé."
            ));
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole() != null ? dto.getRole() : Role.PATIENT);

        if (Role.PRO.equals(user.getRole())) {
            user.setSpecialty(dto.getSpecialty());
            user.setBio(dto.getBio());
            user.setScore(dto.getScore() != null ? dto.getScore() : 50);
        }

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId());

        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "token", token,
                "user", toUserMap(saved)
        ));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody RegisterDto dto) {

        Optional<User> optUser = userRepository.findByEmail(dto.getEmail());
        if (optUser.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Email ou mot de passe incorrect."
            ));
        }

        User user = optUser.get();
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Email ou mot de passe incorrect."
            ));
        }

        String token = jwtUtil.generateToken(user.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", token,
                "user", toUserMap(user)
        ));
    }

    public static Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",        user.getId());
        map.put("_id",       user.getId());
        map.put("name",      user.getName());
        map.put("email",     user.getEmail());
        map.put("role",      user.getRole() != null ? user.getRole().toJson() : null);
        map.put("specialty", user.getSpecialty());
        map.put("bio",       user.getBio());
        map.put("score",     user.getScore());
        return map;
    }
}
