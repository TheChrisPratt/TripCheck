package com.anodyzed.tripcheck.trip;

import com.anodyzed.tripcheck.model.Stop;
import com.anodyzed.tripcheck.model.Task;
import com.anodyzed.tripcheck.model.TaskCategory;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.model.Trip;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class TripDateCalculationTest {

    @Test
    void tripWithoutStops_endingDateEqualsStartingDate() {
        LocalDate startDate = LocalDate.of(2026, 6, 1);
        Trip trip = Trip.builder()
                .name("Grand Canyon Roadtrip")
                .startingDate(startDate)
                .build();

        trip.recalculateDates();

        assertEquals(startDate, trip.getEndingDate());
    }

    @Test
    void tripWithSingleStop_calculatesCorrectDates() {
        LocalDate startDate = LocalDate.of(2026, 6, 1);
        Trip trip = Trip.builder()
                .name("Grand Canyon Roadtrip")
                .startingDate(startDate)
                .build();

        Stop stop1 = Stop.builder()
                .name("Flagstaff KOA")
                .numberOfNights(3)
                .build();

        trip.addStop(stop1);

        assertEquals(startDate, stop1.getStopDate());
        assertEquals(LocalDate.of(2026, 6, 4), trip.getEndingDate());
    }

    @Test
    void tripWithMultipleStops_calculatesSequentialStopDatesAndEndingDate() {
        LocalDate startDate = LocalDate.of(2026, 6, 1);
        Trip trip = Trip.builder()
                .name("Southwest Loop")
                .startingDate(startDate)
                .build();

        Stop stop1 = Stop.builder().name("Stop 1 - Sedona").numberOfNights(2).build();
        Stop stop2 = Stop.builder().name("Stop 2 - Grand Canyon").numberOfNights(3).build();
        Stop stop3 = Stop.builder().name("Stop 3 - Zion").numberOfNights(4).build();

        trip.addStop(stop1);
        trip.addStop(stop2);
        trip.addStop(stop3);

        // Stop 1: June 1, 2 nights -> next stop on June 3
        assertEquals(LocalDate.of(2026, 6, 1), stop1.getStopDate());
        assertEquals(0, stop1.getOrderIndex());

        // Stop 2: June 3, 3 nights -> next stop on June 6
        assertEquals(LocalDate.of(2026, 6, 3), stop2.getStopDate());
        assertEquals(1, stop2.getOrderIndex());

        // Stop 3: June 6, 4 nights -> trip ending on June 10
        assertEquals(LocalDate.of(2026, 6, 6), stop3.getStopDate());
        assertEquals(2, stop3.getOrderIndex());

        assertEquals(LocalDate.of(2026, 6, 10), trip.getEndingDate());
    }

    @Test
    void tasksAreCategorizedProperlyAndDefaultToIncomplete() {
        Trip trip = Trip.builder()
                .name("Camping Trip")
                .startingDate(LocalDate.of(2026, 7, 1))
                .build();

        trip.addPreTripTask("Buy groceries");
        trip.addDepartureDayTask("Pack cooler");
        trip.addReturnDayTask("Unpack camping gear");

        assertEquals(1, trip.getPreTripTasks().size());
        assertEquals("Buy groceries", trip.getPreTripTasks().get(0).getDescription());
        assertEquals(TaskCategory.PRE_TRIP, trip.getPreTripTasks().get(0).getCategory());
        assertEquals(TaskStatus.INCOMPLETE, trip.getPreTripTasks().get(0).getStatus());

        assertEquals(1, trip.getDepartureDayTasks().size());
        assertEquals("Pack cooler", trip.getDepartureDayTasks().get(0).getDescription());
        assertEquals(TaskCategory.DEPARTURE_DAY, trip.getDepartureDayTasks().get(0).getCategory());

        assertEquals(1, trip.getReturnDayTasks().size());
        assertEquals("Unpack camping gear", trip.getReturnDayTasks().get(0).getDescription());
        assertEquals(TaskCategory.RETURN_DAY, trip.getReturnDayTasks().get(0).getCategory());
    }

    @Test
    void stopTasksAreCategorizedProperly() {
        Stop stop = Stop.builder()
                .name("Yosemite Pines")
                .numberOfNights(2)
                .build();

        stop.addArrivalTask("Check in at ranger station");
        stop.addDepartureTask("Empty trash and checkout");

        assertEquals(1, stop.getArrivalTasks().size());
        assertEquals("Check in at ranger station", stop.getArrivalTasks().get(0).getDescription());
        assertEquals(TaskCategory.ARRIVAL, stop.getArrivalTasks().get(0).getCategory());
        assertEquals(TaskStatus.INCOMPLETE, stop.getArrivalTasks().get(0).getStatus());

        assertEquals(1, stop.getDepartureTasks().size());
        assertEquals("Empty trash and checkout", stop.getDepartureTasks().get(0).getDescription());
        assertEquals(TaskCategory.DEPARTURE, stop.getDepartureTasks().get(0).getCategory());
    }
}
