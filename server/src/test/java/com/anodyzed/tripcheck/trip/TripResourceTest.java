package com.anodyzed.tripcheck.trip;

import jakarta.servlet.http.Cookie;

import com.anodyzed.tripcheck.dto.CreateTripRequest;
import com.anodyzed.tripcheck.security.jwt.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
  void fullTripLifecycle_viaRestEndpoints () throws Exception {
    String token = jwtService.generateToken("tripuser");
    Cookie cookie = new Cookie("TRIPCHECK_TOKEN",token);

      // 1. Create Trip
    CreateTripRequest tripReq = CreateTripRequest.builder()
      .name("Grand Canyon Adventure")
      .startingDate(LocalDate.of(2026,10,5))
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

    Map<?,?> tripData = objectMapper.readValue(createTripResult.getResponse().getContentAsString(),Map.class);
    Number tripIdNum = (Number)tripData.get("id");
    long tripId = tripIdNum.longValue();

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

    Map<?,?> stopData = objectMapper.readValue(addStopResult.getResponse().getContentAsString(),Map.class);
    Number stopIdNum = (Number)stopData.get("id");
    long stopId = stopIdNum.longValue();

      // 6. Add Arrival Task to Stop
    MvcResult arrivalTaskResult = mockMvc.perform(post("/api/stops/" + stopId + "/tasks/arrival")
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"description\":\"Check in at South Rim\"}"))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.category").value("ARRIVAL"))
      .andReturn();

    Map<?,?> taskData = objectMapper.readValue(arrivalTaskResult.getResponse().getContentAsString(),Map.class);
    Number taskIdNum = (Number)taskData.get("id");
    long taskId = taskIdNum.longValue();

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

      // 8b. Update Trip Name & Starting Date
    mockMvc.perform(put("/api/trips/" + tripId)
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Grand Canyon & Beyond\",\"startingDate\":\"2026-10-10\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Grand Canyon & Beyond"))
      .andExpect(jsonPath("$.startingDate").value("2026-10-10"))
      .andExpect(jsonPath("$.stops[0].stopDate").value("2026-10-10"))
      .andExpect(jsonPath("$.endingDate").value("2026-10-13"));

      // 8c. Clone Stop
    mockMvc.perform(post("/api/stops/" + stopId + "/clone")
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"North Rim Lodge\",\"location\":\"Grand Canyon North\",\"numberOfNights\":2}"))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.id").exists())
      .andExpect(jsonPath("$.name").value("North Rim Lodge"))
      .andExpect(jsonPath("$.orderIndex").value(1))
      .andExpect(jsonPath("$.arrivalTasks[0].status").value("INCOMPLETE"))
      .andExpect(jsonPath("$.arrivalTasks[0].description").value("Check in at South Rim"));

      // 8d. Update Stop
    mockMvc.perform(put("/api/stops/" + stopId)
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"South Rim Luxury Lodge\",\"location\":\"Grand Canyon Village West\",\"numberOfNights\":4,\"confirmationCode\":\"CONF-888\"}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.id").value(stopId))
      .andExpect(jsonPath("$.name").value("South Rim Luxury Lodge"))
      .andExpect(jsonPath("$.location").value("Grand Canyon Village West"))
      .andExpect(jsonPath("$.numberOfNights").value(4))
      .andExpect(jsonPath("$.confirmationCode").value("CONF-888"));

      // 9. List User Trips
    mockMvc.perform(get("/api/trips")
        .cookie(cookie))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].name").value("Grand Canyon & Beyond"))
      .andExpect(jsonPath("$[0].stopCount").value(2));
  } //fullTripLifecycle_viaRestEndpoints

  @Test
  void createTrip_validationErrors () throws Exception {
    String token = jwtService.generateToken("user");
    Cookie cookie = new Cookie("TRIPCHECK_TOKEN",token);

    mockMvc.perform(post("/api/trips")
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"\"}"))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.error").value("Validation Failed"));
  } //createTrip_validationErrors

  @Test
  void stopExtendedFieldsAndCatalogEndpoints () throws Exception {
    String token = jwtService.generateToken("campsite_user");
    Cookie cookie = new Cookie("TRIPCHECK_TOKEN",token);

      // 1. Create Trip
    MvcResult tripResult = mockMvc.perform(post("/api/trips")
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Camping Trip\",\"startingDate\":\"2026-07-01\"}"))
      .andExpect(status().isCreated())
      .andReturn();

    Map<?,?> tripData = objectMapper.readValue(tripResult.getResponse().getContentAsString(),Map.class);
    long tripId = ((Number)tripData.get("id")).longValue();

      // 2. Add Stop with extended fields
    String stopJson = """
      {
        "name": "Pine Ridge Campground",
        "location": "Site #10",
        "numberOfNights": 2,
        "hookups": ["Electric", "Water"],
        "checkinTime": "15:00",
        "checkoutTime": "11:00",
        "amenities": ["Trails", "Lake View"],
        "services": ["Propane", "Firewood"],
        "codes": "Gate: #9876, WiFi: pine123"
      }
      """;

    MvcResult stopResult = mockMvc.perform(post("/api/trips/" + tripId + "/stops")
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content(stopJson))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.name").value("Pine Ridge Campground"))
      .andExpect(jsonPath("$.checkinTime").value("15:00"))
      .andExpect(jsonPath("$.checkoutTime").value("11:00"))
      .andExpect(jsonPath("$.codes").value("Gate: #9876, WiFi: pine123"))
      .andExpect(jsonPath("$.hookups").isArray())
      .andExpect(jsonPath("$.amenities").isArray())
      .andExpect(jsonPath("$.services").isArray())
      .andReturn();

    Map<?,?> stopData = objectMapper.readValue(stopResult.getResponse().getContentAsString(),Map.class);
    long stopId = ((Number)stopData.get("id")).longValue();

      // 3. Query catalog suggestions
    mockMvc.perform(get("/api/stops/amenities").cookie(cookie))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0]").value("Lake View"))
      .andExpect(jsonPath("$[1]").value("Trails"));

    mockMvc.perform(get("/api/stops/services").cookie(cookie))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0]").value("Firewood"))
      .andExpect(jsonPath("$[1]").value("Propane"));

      // 4. Update Stop with additional label
    String updateJson = """
      {
        "name": "Pine Ridge Campground Updated",
        "numberOfNights": 3,
        "hookups": ["Electric", "Water", "Sewer"],
        "checkinTime": "14:00",
        "checkoutTime": "10:00",
        "amenities": ["Trails", "Lake View", "Boat Launch"],
        "services": ["Propane", "Firewood", "Dump Station"],
        "codes": "Gate: #1111"
      }
      """;

    mockMvc.perform(put("/api/stops/" + stopId)
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content(updateJson))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Pine Ridge Campground Updated"))
      .andExpect(jsonPath("$.checkinTime").value("14:00"))
      .andExpect(jsonPath("$.checkoutTime").value("10:00"))
      .andExpect(jsonPath("$.codes").value("Gate: #1111"));

      // Check catalog expanded
    mockMvc.perform(get("/api/stops/amenities").cookie(cookie))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0]").value("Boat Launch"));

      // 5. Test codes length validation (> 128 characters)
    String longCode = "a".repeat(129);
    String invalidStopJson = """
      {
        "name": "Invalid Stop",
        "codes": "%s"
      }
      """.formatted(longCode);

    mockMvc.perform(put("/api/stops/" + stopId)
        .cookie(cookie)
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidStopJson))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.error").value("Validation Failed"));
  } //stopExtendedFieldsAndCatalogEndpoints

} //*TripResourceTest
