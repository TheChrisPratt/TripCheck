package com.anodyzed.tripcheck.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SpaWebRoutingTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void spaRoutes_fallbackToIndexHtml() throws Exception {
        mockMvc.perform(get("/trips"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/login"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/trips/1"))
                .andExpect(status().isOk());
    }

    @Test
    void unknownApiRoute_doesNotFallbackToIndexHtml_returnsNotFoundOrUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/non-existent-endpoint"))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}
