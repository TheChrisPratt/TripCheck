package com.anodyzed.tripcheck.trip;

import com.anodyzed.tripcheck.model.Stop;
import com.anodyzed.tripcheck.model.Task;
import com.anodyzed.tripcheck.model.TaskCategory;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.model.Trip;
import com.anodyzed.tripcheck.repository.StopRepository;
import com.anodyzed.tripcheck.repository.TaskRepository;
import com.anodyzed.tripcheck.repository.TripRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TripPersistenceTest {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    void saveAndRetrieveTripWithStopsAndTasks() {
        Trip trip = Trip.builder()
                .name("Pacific Coast Highway")
                .startingDate(LocalDate.of(2026, 8, 10))
                .userId("user123")
                .build();

        trip.addPreTripTask("Check oil level");
        trip.addDepartureDayTask("Load bikes");
        trip.addReturnDayTask("Unpack vehicle");

        Stop stop1 = Stop.builder()
                .name("Big Sur")
                .location("California State Route 1")
                .numberOfNights(2)
                .webAddress("https://bigsur.example.com")
                .telephoneNumber("555-1234")
                .confirmationCode("BS-9876")
                .siteNumber("Site 42")
                .notes("Ocean view site")
                .build();
        stop1.addArrivalTask("Set up tent");
        stop1.addDepartureTask("Extinguish campfire");

        trip.addStop(stop1);

        Trip saved = tripRepository.saveAndFlush(trip);

        assertNotNull(saved.getId());
        assertEquals(LocalDate.of(2026, 8, 10), saved.getStops().get(0).getStopDate());
        assertEquals(LocalDate.of(2026, 8, 12), saved.getEndingDate());

        List<Trip> userTrips = tripRepository.findByUserIdOrderByStartingDateAsc("user123");
        assertEquals(1, userTrips.size());
        assertEquals("Pacific Coast Highway", userTrips.get(0).getName());

        List<Task> preTripTasks = taskRepository.findByTripIdAndCategory(saved.getId(), TaskCategory.PRE_TRIP);
        assertEquals(1, preTripTasks.size());
        assertEquals("Check oil level", preTripTasks.get(0).getDescription());
        assertEquals(TaskStatus.INCOMPLETE, preTripTasks.get(0).getStatus());

        List<Stop> stops = stopRepository.findByTripIdOrderByOrderIndexAsc(saved.getId());
        assertEquals(1, stops.size());
        assertEquals("Big Sur", stops.get(0).getName());

        List<Task> arrivalTasks = taskRepository.findByStopIdAndCategory(stops.get(0).getId(), TaskCategory.ARRIVAL);
        assertEquals(1, arrivalTasks.size());
        assertEquals("Set up tent", arrivalTasks.get(0).getDescription());
    }
}
