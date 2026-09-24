package com.anodyzed.tripcheck.trip;

import com.anodyzed.tripcheck.dto.*;
import com.anodyzed.tripcheck.model.TaskCategory;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.repository.StopRepository;
import com.anodyzed.tripcheck.repository.TaskRepository;
import com.anodyzed.tripcheck.repository.TripRepository;
import com.anodyzed.tripcheck.services.StopService;
import com.anodyzed.tripcheck.services.TaskService;
import com.anodyzed.tripcheck.services.TripService;
import com.anodyzed.tripcheck.util.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TripServiceTest {

    @Autowired
    private TripService tripService;

    @Autowired
    private StopService stopService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private TaskRepository taskRepository;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        stopRepository.deleteAll();
        tripRepository.deleteAll();
    }

    @Test
    void createTrip_setsDatesAndPersists() {
        CreateTripRequest request = CreateTripRequest.builder()
                .name("Yellowstone Expedition")
                .startingDate(LocalDate.of(2026, 7, 1))
                .build();

        TripDetailResponse created = tripService.createTrip(request, "alice");

        assertNotNull(created.getId());
        assertEquals("Yellowstone Expedition", created.getName());
        assertEquals(LocalDate.of(2026, 7, 1), created.getStartingDate());
        assertEquals(LocalDate.of(2026, 7, 1), created.getEndingDate());
        assertEquals("alice", created.getUserId());
    }

    @Test
    void addStopsAndRecalculateDates() {
        TripDetailResponse created = tripService.createTrip(
                CreateTripRequest.builder()
                        .name("Road Trip")
                        .startingDate(LocalDate.of(2026, 6, 1))
                        .build(),
                "alice"
        );

        StopResponse stop1 = stopService.addStop(
                created.getId(),
                CreateStopRequest.builder()
                        .name("Stop A")
                        .location("Location A")
                        .numberOfNights(3)
                        .build(),
                "alice"
        );

        StopResponse stop2 = stopService.addStop(
                created.getId(),
                CreateStopRequest.builder()
                        .name("Stop B")
                        .location("Location B")
                        .numberOfNights(2)
                        .build(),
                "alice"
        );

        TripDetailResponse updated = tripService.getTripById(created.getId(), "alice");

        assertEquals(2, updated.getStops().size());
        assertEquals(LocalDate.of(2026, 6, 1), updated.getStops().get(0).getStopDate());
        assertEquals(LocalDate.of(2026, 6, 4), updated.getStops().get(1).getStopDate());
        assertEquals(LocalDate.of(2026, 6, 6), updated.getEndingDate());
    }

    @Test
    void manageTripAndStopTasks() {
        TripDetailResponse trip = tripService.createTrip(
                CreateTripRequest.builder()
                        .name("Task Test Trip")
                        .startingDate(LocalDate.of(2026, 9, 1))
                        .build(),
                "alice"
        );

        TaskResponse preTrip = taskService.addPreTripTask(
                trip.getId(),
                CreateTaskRequest.builder().description("Pack luggage").build(),
                "alice"
        );
        assertEquals(TaskStatus.INCOMPLETE, preTrip.getStatus());
        assertEquals(TaskCategory.PRE_TRIP, preTrip.getCategory());

        TaskResponse departureDay = taskService.addDepartureDayTask(
                trip.getId(),
                CreateTaskRequest.builder().description("Lock front door").build(),
                "alice"
        );
        assertEquals(TaskCategory.DEPARTURE_DAY, departureDay.getCategory());

        TaskResponse returnDay = taskService.addReturnDayTask(
                trip.getId(),
                CreateTaskRequest.builder().description("Water plants").build(),
                "alice"
        );
        assertEquals(TaskCategory.RETURN_DAY, returnDay.getCategory());

        StopResponse stop = stopService.addStop(
                trip.getId(),
                CreateStopRequest.builder().name("Hotel").numberOfNights(1).build(),
                "alice"
        );

        TaskResponse arrivalTask = taskService.addArrivalTask(
                stop.getId(),
                CreateTaskRequest.builder().description("Check in at reception").build(),
                "alice"
        );
        assertEquals(TaskCategory.ARRIVAL, arrivalTask.getCategory());

        TaskResponse updatedStatus = taskService.updateTaskStatus(
                preTrip.getId(),
                UpdateTaskStatusRequest.builder().status(TaskStatus.COMPLETED).build(),
                "alice"
        );
        assertEquals(TaskStatus.COMPLETED, updatedStatus.getStatus());

        List<TripSummaryResponse> summaries = tripService.getUserTrips("alice");
        assertEquals(1, summaries.size());
        assertEquals(4, summaries.get(0).getTotalTaskCount());
        assertEquals(1, summaries.get(0).getCompletedTaskCount());
    }

    @Test
    void userIsolation_throwsWhenAccessingOtherUserData() {
        TripDetailResponse trip = tripService.createTrip(
                CreateTripRequest.builder()
                        .name("Private Trip")
                        .startingDate(LocalDate.of(2026, 5, 1))
                        .build(),
                "alice"
        );

        assertThrows(ResourceNotFoundException.class, () -> {
            tripService.getTripById(trip.getId(), "bob");
        });
    }
}
