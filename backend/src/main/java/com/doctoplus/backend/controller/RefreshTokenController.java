package com.doctoplus.backend.controller;

import com.doctoplus.backend.model.User;
import com.doctoplus.backend.repository.UserRepository;
import com.doctoplus.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class RefreshTokenController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestParam("refreshToken") String refreshToken) {
        Optional<User> userOptional = userRepository.findAll().stream()
                .filter(user -> refreshToken.equals(user.getRefreshToken()))
                .findFirst();

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String newToken = jwtTokenProvider.createToken(user.getId(), user.getRole());
            String newRefreshToken = UUID.randomUUID().toString();
            user.setRefreshToken(newRefreshToken);
            userRepository.save(user);
            return ResponseEntity.ok().body("{" +
                    "\"token\": \"" + newToken + "\", " +
                    "\"refreshToken\": \"" + newRefreshToken + "\"}");
        }

        return ResponseEntity.status(401).body("Invalid refresh token");
    }
}