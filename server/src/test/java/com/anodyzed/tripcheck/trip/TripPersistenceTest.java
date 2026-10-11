package com.anodyzed.tripcheck.trip;

import com.anodyzed.tripcheck.model.Stop;
import com.anodyzed.tripcheck.model.Task;
import com.anodyzed.tripcheck.model.TaskCategory;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.model.Trip;
import com.anodyzed.tripcheck.repository.StopRepository;
import com.anodyzed.tripcheck.repository.TaskRepository;
import com.anodyzed.tripcheck.repository.TripRepository;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

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
        assertEquals(LocalDate.of(2026, 8, 10), saved.getStops().getFirst().getStopDate());
        assertEquals(LocalDate.of(2026, 8, 12), saved.getEndingDate());

        List<Trip> userTrips = tripRepository.findByUserIdOrderByStartingDateAsc("user123");
        assertEquals(1, userTrips.size());
        assertEquals("Pacific Coast Highway", userTrips.getFirst().getName());

        List<Task> preTripTasks = taskRepository.findByTripIdAndCategory(saved.getId(), TaskCategory.PRE_TRIP);
        assertEquals(1, preTripTasks.size());
        assertEquals("Check oil level", preTripTasks.getFirst().getDescription());
        assertEquals(TaskStatus.INCOMPLETE, preTripTasks.getFirst().getStatus());
        assertEquals(0, preTripTasks.getFirst().getOrderIndex());

        List<Stop> stops = stopRepository.findByTripIdOrderByOrderIndexAsc(saved.getId());
        assertEquals(1, stops.size());
        assertEquals("Big Sur", stops.getFirst().getName());

        List<Task> arrivalTasks = taskRepository.findByStopIdAndCategory(stops.getFirst().getId(), TaskCategory.ARRIVAL);
        assertEquals(1, arrivalTasks.size());
        assertEquals("Set up tent", arrivalTasks.getFirst().getDescription());
        assertEquals(0, arrivalTasks.getFirst().getOrderIndex());
    }

    @Test
    void taskOrderIndex_persistsAndOrdersCorrectly() {
        Trip trip = Trip.builder()
                .name("Order Test Trip")
                .startingDate(LocalDate.of(2026, 9, 1))
                .userId("orderUser")
                .build();

        trip.addPreTripTask("First Task");
        trip.addPreTripTask("Second Task");
        trip.addPreTripTask("Third Task");

        Trip saved = tripRepository.saveAndFlush(trip);

        List<Task> tasks = taskRepository.findByTripIdAndCategoryOrderByOrderIndexAsc(saved.getId(), TaskCategory.PRE_TRIP);
        assertEquals(3, tasks.size());
        assertEquals("First Task", tasks.get(0).getDescription());
        assertEquals(0, tasks.get(0).getOrderIndex());
        assertEquals("Second Task", tasks.get(1).getDescription());
        assertEquals(1, tasks.get(1).getOrderIndex());
        assertEquals("Third Task", tasks.get(2).getDescription());
        assertEquals(2, tasks.get(2).getOrderIndex());
    }
}
