package com.anodyzed.tripcheck.security;

import com.anodyzed.tripcheck.security.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    void protectedEndpoint_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicWebAuthnRegistration_withoutAuth_isAccessible() throws Exception {
        mockMvc.perform(post("/api/auth/webauthn/register-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"displayName\":\"Test User\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.challenge").exists())
                .andExpect(jsonPath("$.rp.id").value("localhost"));
    }

    @Test
    void publicWebAuthnLogin_withoutAuth_isAccessible() throws Exception {
        mockMvc.perform(post("/api/auth/webauthn/login-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.challenge").exists());
    }

    @Test
    void protectedEndpoint_withValidJwtHeader_returnsSuccess() throws Exception {
        String token = jwtService.generateToken("testuser");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void protectedEndpoint_withValidJwtCookie_returnsSuccess() throws Exception {
        String token = jwtService.generateToken("cookieuser");

        mockMvc.perform(get("/api/auth/me")
                        .cookie(new Cookie("TRIPCHECK_TOKEN", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("cookieuser"));
    }
}
