package com.pankaj.backend.security;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Key;
import java.util.Base64;

@RestController
public class JwtKeyGeneratorController {

    @GetMapping("/api/test/generate-key")
    public String generateKey() {
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
        return "Generated JWT Key:\n" + base64Key;
    }
}
