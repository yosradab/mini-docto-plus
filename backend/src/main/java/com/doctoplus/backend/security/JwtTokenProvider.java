package com.doctoplus.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;
import com.doctoplus.backend.model.Role;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {
    private static final String SECRET_KEY = "TZRA4604temjUOHfVr2hFUzSPRFpzl352C5VfbBY5O6jMT94ZZHZBYU6jKABTpmv";
    private static final long VALIDITY_IN_MILLISECONDS = 3600_000; // 1 hour

    public String createToken(String userId, Role role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + VALIDITY_IN_MILLISECONDS);
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role.name())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }


    public String createRefreshToken() {
        return UUID.randomUUID().toString();
    }
}
