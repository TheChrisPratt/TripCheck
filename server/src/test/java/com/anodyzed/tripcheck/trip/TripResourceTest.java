package com.anodyzed.tripcheck.trip;

import com.anodyzed.tripcheck.dto.CreateTripRequest;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.security.jwt.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import java.time.LocalDate;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TripResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullTripLifecycle_viaRestEndpoints() throws Exception {
        String token = jwtService.generateToken("tripuser");
        Cookie cookie = new Cookie("TRIPCHECK_TOKEN", token);

        // 1. Create Trip
        CreateTripRequest tripReq = CreateTripRequest.builder()
                .name("Grand Canyon Adventure")
                .startingDate(LocalDate.of(2026, 10, 5))
                .build();

        MvcResult createTripResult = mockMvc.perform(post("/api/trips")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tripReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Grand Canyon Adventure"))
                .andExpect(jsonPath("$.startingDate").value("2026-10-05"))
                .andReturn();

        Map<?, ?> tripData = objectMapper.readValue(createTripResult.getResponse().getContentAsString(), Map.class);
        Number tripIdNum = (Number) tripData.get("id");
        Long tripId = tripIdNum.longValue();

        // 2. Add Pre-Trip Task
        mockMvc.perform(post("/api/trips/" + tripId + "/tasks/pre-trip")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"Book rental car\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Book rental car"))
                .andExpect(jsonPath("$.status").value("INCOMPLETE"))
                .andExpect(jsonPath("$.category").value("PRE_TRIP"));

        // 3. Add Departure-Day Task
        mockMvc.perform(post("/api/trips/" + tripId + "/tasks/departure-day")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"Turn off AC\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category").value("DEPARTURE_DAY"));

        // 4. Add Return-Day Task
        mockMvc.perform(post("/api/trips/" + tripId + "/tasks/return-day")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"Check mail\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category").value("RETURN_DAY"));

        // 5. Add Stop
        MvcResult addStopResult = mockMvc.perform(post("/api/trips/" + tripId + "/stops")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"South Rim Lodge\",\"location\":\"Grand Canyon Village\",\"numberOfNights\":3}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("South Rim Lodge"))
                .andExpect(jsonPath("$.stopDate").value("2026-10-05"))
                .andReturn();

        Map<?, ?> stopData = objectMapper.readValue(addStopResult.getResponse().getContentAsString(), Map.class);
        Number stopIdNum = (Number) stopData.get("id");
        Long stopId = stopIdNum.longValue();

        // 6. Add Arrival Task to Stop
        MvcResult arrivalTaskResult = mockMvc.perform(post("/api/stops/" + stopId + "/tasks/arrival")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"Check in at South Rim\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category").value("ARRIVAL"))
                .andReturn();

        Map<?, ?> taskData = objectMapper.readValue(arrivalTaskResult.getResponse().getContentAsString(), Map.class);
        Number taskIdNum = (Number) taskData.get("id");
        Long taskId = taskIdNum.longValue();

        // 7. Toggle Task Status
        mockMvc.perform(patch("/api/tasks/" + taskId + "/status")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // 8. Get Trip Details
        mockMvc.perform(get("/api/trips/" + tripId)
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preTripTasks").isArray())
                .andExpect(jsonPath("$.stops[0].name").value("South Rim Lodge"))
                .andExpect(jsonPath("$.endingDate").value("2026-10-08"));

        // 9. List User Trips
        mockMvc.perform(get("/api/trips")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Grand Canyon Adventure"))
                .andExpect(jsonPath("$[0].stopCount").value(1));
    }

    @Test
    void createTrip_validationErrors() throws Exception {
        String token = jwtService.generateToken("user");
        Cookie cookie = new Cookie("TRIPCHECK_TOKEN", token);

        mockMvc.perform(post("/api/trips")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }
}
