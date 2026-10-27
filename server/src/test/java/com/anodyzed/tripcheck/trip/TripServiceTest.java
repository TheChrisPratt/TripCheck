package com.anodyzed.tripcheck.trip;

import com.anodyzed.tripcheck.dto.AddTripUserRequest;
import com.anodyzed.tripcheck.dto.CloneStopRequest;
import com.anodyzed.tripcheck.dto.CloneTripRequest;
import com.anodyzed.tripcheck.dto.CreateStopRequest;
import com.anodyzed.tripcheck.dto.CreateTaskRequest;
import com.anodyzed.tripcheck.dto.CreateTripRequest;
import com.anodyzed.tripcheck.dto.StopResponse;
import com.anodyzed.tripcheck.dto.TaskResponse;
import com.anodyzed.tripcheck.dto.TripDetailResponse;
import com.anodyzed.tripcheck.dto.TripSummaryResponse;
import com.anodyzed.tripcheck.dto.UpdateStopRequest;
import com.anodyzed.tripcheck.dto.UpdateTaskRequest;
import com.anodyzed.tripcheck.dto.UpdateTaskStatusRequest;
import com.anodyzed.tripcheck.dto.UpdateTripRequest;
import com.anodyzed.tripcheck.model.TaskCategory;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.repository.AmenityRepository;
import com.anodyzed.tripcheck.repository.StopRepository;
import com.anodyzed.tripcheck.repository.StopServiceCatalogRepository;
import com.anodyzed.tripcheck.repository.TaskRepository;
import com.anodyzed.tripcheck.repository.TripRepository;
import com.anodyzed.tripcheck.repository.UserRepository;
import com.anodyzed.tripcheck.services.StopService;
import com.anodyzed.tripcheck.services.TaskService;
import com.anodyzed.tripcheck.services.TripService;
import com.anodyzed.tripcheck.services.UserService;
import com.anodyzed.tripcheck.util.exception.BadRequestException;
import com.anodyzed.tripcheck.util.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

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

  @Autowired
  private AmenityRepository amenityRepository;

  @Autowired
  private StopServiceCatalogRepository stopServiceCatalogRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private UserService userService;

  @BeforeEach
  void setUp () {
    taskRepository.deleteAll();
    stopRepository.deleteAll();
    tripRepository.deleteAll();
    userRepository.deleteAll();
    amenityRepository.deleteAll();
    stopServiceCatalogRepository.deleteAll();
  } //setUp

  @Test
  void createTrip_setsDatesAndPersists () {
    CreateTripRequest request = CreateTripRequest.builder()
      .name("Yellowstone Expedition")
      .startingDate(LocalDate.of(2026,7,1))
      .build();

    TripDetailResponse created = tripService.createTrip(request,"alice");

    assertNotNull(created.getId());
    assertEquals("Yellowstone Expedition",created.getName());
    assertEquals(LocalDate.of(2026,7,1),created.getStartingDate());
    assertEquals(LocalDate.of(2026,7,1),created.getEndingDate());
    assertEquals(1,created.getUsers().size());
    assertEquals("alice",created.getUsers().getFirst().getUsername());
  } //createTrip_setsDatesAndPersists

  @Test
  void addStopsAndRecalculateDates () {
    TripDetailResponse created = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Road Trip")
        .startingDate(LocalDate.of(2026,6,1))
        .build(),
      "alice"
    );

    StopResponse ignore = stopService.addStop(
      created.getId(),
      CreateStopRequest.builder()
        .name("Stop A")
        .location("Location A")
        .numberOfNights(3)
        .build(),
      "alice"
    );

    StopResponse ignored = stopService.addStop(
      created.getId(),
      CreateStopRequest.builder()
        .name("Stop B")
        .location("Location B")
        .numberOfNights(2)
        .build(),
      "alice"
    );

    TripDetailResponse updated = tripService.getTripById(created.getId(),"alice");

    assertEquals(2,updated.getStops().size());
    assertEquals(LocalDate.of(2026,6,1),updated.getStops().get(0).getStopDate());
    assertEquals(LocalDate.of(2026,6,4),updated.getStops().get(1).getStopDate());
    assertEquals(LocalDate.of(2026,6,6),updated.getEndingDate());
  } //addStopsAndRecalculateDates

  @Test
  void manageTripAndStopTasks () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Task Test Trip")
        .startingDate(LocalDate.of(2026,9,1))
        .build(),
      "alice"
    );

    TaskResponse preTrip = taskService.addPreTripTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Pack luggage").build(),
      "alice"
    );
    assertEquals(TaskStatus.INCOMPLETE,preTrip.getStatus());
    assertEquals(TaskCategory.PRE_TRIP,preTrip.getCategory());
    assertEquals(0,preTrip.getOrderIndex());

    TaskResponse preTrip2 = taskService.addPreTripTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Check passports").build(),
      "alice"
    );
    assertEquals(1,preTrip2.getOrderIndex());

    TaskResponse departureDay = taskService.addDepartureDayTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Lock front door").build(),
      "alice"
    );
    assertEquals(TaskCategory.DEPARTURE_DAY,departureDay.getCategory());
    assertEquals(0,departureDay.getOrderIndex());

    TaskResponse returnDay = taskService.addReturnDayTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Water plants").build(),
      "alice"
    );
    assertEquals(TaskCategory.RETURN_DAY,returnDay.getCategory());
    assertEquals(0,returnDay.getOrderIndex());

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
    assertEquals(TaskCategory.ARRIVAL,arrivalTask.getCategory());
    assertEquals(0,arrivalTask.getOrderIndex());

    TaskResponse arrivalTask2 = taskService.addArrivalTask(
      stop.getId(),
      CreateTaskRequest.builder().description("Unpack bags").build(),
      "alice"
    );
    assertEquals(1,arrivalTask2.getOrderIndex());

    TaskResponse updatedStatus = taskService.updateTaskStatus(
      preTrip.getId(),
      UpdateTaskStatusRequest.builder().status(TaskStatus.COMPLETED).build(),
      "alice"
    );
    assertEquals(TaskStatus.COMPLETED,updatedStatus.getStatus());

    List<TripSummaryResponse> summaries = tripService.getUserTrips("alice");
    assertEquals(1,summaries.size());
    assertEquals(6,summaries.getFirst().getTotalTaskCount());
    assertEquals(1,summaries.getFirst().getCompletedTaskCount());
  } //manageTripAndStopTasks

  @Test
  void userIsolation_throwsWhenAccessingOtherUserData () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Private Trip")
        .startingDate(LocalDate.of(2026,5,1))
        .build(),
      "alice"
    );

    assertThrows(ResourceNotFoundException.class,() -> tripService.getTripById(trip.getId(),"bob"));
  } //userIsolation_throwsWhenAccessingOtherUserData

  @Test
  void updateTrip_updatesNameAndRecalculatesDates () {
    TripDetailResponse created = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Initial Trip Name")
        .startingDate(LocalDate.of(2026,6,1))
        .build(),
      "alice"
    );

    stopService.addStop(
      created.getId(),
      CreateStopRequest.builder()
        .name("Stop 1")
        .numberOfNights(3)
        .build(),
      "alice"
    );

    UpdateTripRequest updateReq = UpdateTripRequest.builder()
      .name("Updated Trip Name")
      .startingDate(LocalDate.of(2026,7,10))
      .build();

    TripDetailResponse updated = tripService.updateTrip(created.getId(),updateReq,"alice");

    assertEquals("Updated Trip Name",updated.getName());
    assertEquals(LocalDate.of(2026,7,10),updated.getStartingDate());
    assertEquals(LocalDate.of(2026,7,10),updated.getStops().getFirst().getStopDate());
    assertEquals(LocalDate.of(2026,7,13),updated.getEndingDate());
  } //updateTrip_updatesNameAndRecalculatesDates

  @Test
  void reorderTasks_updatesOrderIndicesCorrectly () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Reorder Test Trip")
        .startingDate(LocalDate.of(2026,10,1))
        .build(),
      "alice"
    );

    TaskResponse task1 = taskService.addPreTripTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Task 1").build(),
      "alice"
    );
    TaskResponse task2 = taskService.addPreTripTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Task 2").build(),
      "alice"
    );
    TaskResponse task3 = taskService.addPreTripTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Task 3").build(),
      "alice"
    );

      // Reorder tasks: task3 first, then task1, then task2
    taskService.reorderTasks(List.of(task3.getId(),task1.getId(),task2.getId()),"alice");

    TripDetailResponse refreshed = tripService.getTripById(trip.getId(),"alice");
    assertEquals(3,refreshed.getPreTripTasks().size());
    assertEquals("Task 3",refreshed.getPreTripTasks().get(0).getDescription());
    assertEquals(0,refreshed.getPreTripTasks().get(0).getOrderIndex());
    assertEquals("Task 1",refreshed.getPreTripTasks().get(1).getDescription());
    assertEquals(1,refreshed.getPreTripTasks().get(1).getOrderIndex());
    assertEquals("Task 2",refreshed.getPreTripTasks().get(2).getDescription());
    assertEquals(2,refreshed.getPreTripTasks().get(2).getOrderIndex());
  } //reorderTasks_updatesOrderIndicesCorrectly

  @Test
  void cloneStop_clonesStopAndItsTasksWithIncompleteStatusAndUpdatesOrderIndices () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Roadtrip Across Parks")
        .startingDate(LocalDate.of(2026,8,1))
        .build(),
      "alice"
    );

    StopResponse ignore = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Stop A").location("Loc A").numberOfNights(2).build(),
      "alice"
    );
    StopResponse stop1 = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Stop B").location("Loc B").numberOfNights(3).build(),
      "alice"
    );
    StopResponse ignored = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Stop C").location("Loc C").numberOfNights(1).build(),
      "alice"
    );

      // Add Arrival and Departure tasks to Stop B (orderIndex = 1)
    TaskResponse arrTask = taskService.addArrivalTask(
      stop1.getId(),
      CreateTaskRequest.builder().description("Check into lodge").build(),
      "alice"
    );
    TaskResponse depTask = taskService.addDepartureTask(
      stop1.getId(),
      CreateTaskRequest.builder().description("Pack cooler and checkout").build(),
      "alice"
    );

      // Mark them completed
    taskService.updateTaskStatus(
      arrTask.getId(),
      UpdateTaskStatusRequest.builder().status(TaskStatus.COMPLETED).build(),
      "alice"
    );
    taskService.updateTaskStatus(
      depTask.getId(),
      UpdateTaskStatusRequest.builder().status(TaskStatus.COMPLETED).build(),
      "alice"
    );

      // Clone Stop B
    CloneStopRequest cloneReq = CloneStopRequest.builder()
      .name("Stop B (Cloned)")
      .location("Loc B New")
      .numberOfNights(4)
      .telephoneNumber("555-1234")
      .confirmationCode("CONF-999")
      .siteNumber("Site 12")
      .notes("Cloned notes")
      .webAddress("https://example.com")
      .build();

    StopResponse clonedStop = stopService.cloneStop(stop1.getId(),cloneReq,"alice");

    assertNotNull(clonedStop.getId());
    Assertions.assertNotEquals(stop1.getId(),clonedStop.getId());
    assertEquals("Stop B (Cloned)",clonedStop.getName());
    assertEquals("Loc B New",clonedStop.getLocation());
    assertEquals(4,clonedStop.getNumberOfNights());
    assertEquals("555-1234",clonedStop.getTelephoneNumber());
    assertEquals("CONF-999",clonedStop.getConfirmationCode());
    assertEquals("Site 12",clonedStop.getSiteNumber());
    assertEquals("Cloned notes",clonedStop.getNotes());
    assertEquals("https://example.com",clonedStop.getWebAddress());
    assertEquals(trip.getId(),clonedStop.getTripId());
    assertEquals(2,clonedStop.getOrderIndex());

      // Verify tasks on cloned stop
    assertEquals(1,clonedStop.getArrivalTasks().size());
    assertEquals(1,clonedStop.getDepartureTasks().size());
    assertEquals("Check into lodge",clonedStop.getArrivalTasks().getFirst().getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedStop.getArrivalTasks().getFirst().getStatus());
    Assertions.assertNotEquals(arrTask.getId(),clonedStop.getArrivalTasks().getFirst().getId());

    assertEquals("Pack cooler and checkout",clonedStop.getDepartureTasks().getFirst().getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedStop.getDepartureTasks().getFirst().getStatus());
    Assertions.assertNotEquals(depTask.getId(),clonedStop.getDepartureTasks().getFirst().getId());

      // Verify the entire trip stop order and date calculations
    TripDetailResponse refreshedTrip = tripService.getTripById(trip.getId(),"alice");
    assertEquals(4,refreshedTrip.getStops().size());

      // Stop 0: Stop A (orderIndex 0, nights 2) -> 2026-08-01
    assertEquals("Stop A",refreshedTrip.getStops().getFirst().getName());
    assertEquals(0,refreshedTrip.getStops().get(0).getOrderIndex());
    assertEquals(LocalDate.of(2026,8,1),refreshedTrip.getStops().get(0).getStopDate());

      // Stop 1: Stop B (orderIndex 1, nights 3) -> 2026-08-03
    assertEquals("Stop B",refreshedTrip.getStops().get(1).getName());
    assertEquals(1,refreshedTrip.getStops().get(1).getOrderIndex());
    assertEquals(LocalDate.of(2026,8,3),refreshedTrip.getStops().get(1).getStopDate());

      // Stop 2: Stop B (Cloned) (orderIndex 2, nights 4) -> 2026-08-06
    assertEquals("Stop B (Cloned)",refreshedTrip.getStops().get(2).getName());
    assertEquals(2,refreshedTrip.getStops().get(2).getOrderIndex());
    assertEquals(LocalDate.of(2026,8,6),refreshedTrip.getStops().get(2).getStopDate());

      // Stop 3: Stop C (orderIndex 3, nights 1) -> 2026-08-10
    assertEquals("Stop C",refreshedTrip.getStops().get(3).getName());
    assertEquals(3,refreshedTrip.getStops().get(3).getOrderIndex());
    assertEquals(LocalDate.of(2026,8,10),refreshedTrip.getStops().get(3).getStopDate());

      // Trip ending date
    assertEquals(LocalDate.of(2026,8,11),refreshedTrip.getEndingDate());
  } //cloneStop_clonesStopAndItsTasksWithIncompleteStatusAndUpdatesOrderIndices

  @Test
  void updateStop_updatesDetailsAndRecalculatesTripDates () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Roadtrip To Update")
        .startingDate(LocalDate.of(2026,8,1))
        .build(),
      "alice"
    );

    StopResponse stop1 = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Original Stop 1").location("Loc 1").numberOfNights(2).build(),
      "alice"
    );
    StopResponse ignore = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Original Stop 2").location("Loc 2").numberOfNights(1).build(),
      "alice"
    );

    UpdateStopRequest updateReq = UpdateStopRequest.builder()
      .name("Updated Stop 1")
      .location("New Location")
      .numberOfNights(5)
      .webAddress("https://newstop.com")
      .telephoneNumber("555-9876")
      .confirmationCode("CONF-123")
      .siteNumber("Site A1")
      .notes("Updated notes")
      .build();

    StopResponse updatedStop = stopService.updateStop(stop1.getId(),updateReq,"alice");

    assertEquals(stop1.getId(),updatedStop.getId());
    assertEquals("Updated Stop 1",updatedStop.getName());
    assertEquals("New Location",updatedStop.getLocation());
    assertEquals(5,updatedStop.getNumberOfNights());
    assertEquals("https://newstop.com",updatedStop.getWebAddress());
    assertEquals("555-9876",updatedStop.getTelephoneNumber());
    assertEquals("CONF-123",updatedStop.getConfirmationCode());
    assertEquals("Site A1",updatedStop.getSiteNumber());
    assertEquals("Updated notes",updatedStop.getNotes());

    TripDetailResponse refreshedTrip = tripService.getTripById(trip.getId(),"alice");
    assertEquals(LocalDate.of(2026,8,1),refreshedTrip.getStops().get(0).getStopDate());
    assertEquals(LocalDate.of(2026,8,6),refreshedTrip.getStops().get(1).getStopDate());
      // Ending date: 2026-08-06 + 1 night = 2026-08-07
    assertEquals(LocalDate.of(2026,8,7),refreshedTrip.getEndingDate());
  } //updateStop_updatesDetailsAndRecalculatesTripDates

  @Test
  void addStop_withExtendedFields_persistsAndExpandsCatalogs () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Camping Trip")
        .startingDate(LocalDate.of(2026,7,1))
        .build(),
      "alice"
    );

    CreateStopRequest stopReq = CreateStopRequest.builder()
      .name("Campground A")
      .location("Forest Reserve")
      .numberOfNights(2)
      .hookups(Set.of("Electric","Water"))
      .checkinTime(LocalTime.of(15,0))
      .checkoutTime(LocalTime.of(11,0))
      .amenities(Set.of("Trails","Scenic View"))
      .services(Set.of("Laundry","Propane"))
      .codes("Gate: #1234, WiFi: woods2026")
      .build();

    StopResponse createdStop = stopService.addStop(trip.getId(),stopReq,"alice");

    assertEquals(Set.of("Electric","Water"),createdStop.getHookups());
    assertEquals(LocalTime.of(15,0),createdStop.getCheckinTime());
    assertEquals(LocalTime.of(11,0),createdStop.getCheckoutTime());
    assertEquals(Set.of("Trails","Scenic View"),createdStop.getAmenities());
    assertEquals(Set.of("Laundry","Propane"),createdStop.getServices());
    assertEquals("Gate: #1234, WiFi: woods2026",createdStop.getCodes());

    List<String> amenities = stopService.getAllAmenities();
    assertEquals(List.of("Scenic View","Trails"),amenities);

    List<String> services = stopService.getAllServices();
    assertEquals(List.of("Laundry","Propane"),services);
  } //addStop_withExtendedFields_persistsAndExpandsCatalogs

  @Test
  void updateStop_withExtendedFields_updatesValuesAndExpandsCatalogs () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Camping Trip")
        .startingDate(LocalDate.of(2026,7,1))
        .build(),
      "alice"
    );

    StopResponse createdStop = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder()
        .name("Campground A")
        .amenities(Set.of("Trails"))
        .services(Set.of("Laundry"))
        .build(),
      "alice"
    );

    UpdateStopRequest updateReq = UpdateStopRequest.builder()
      .name("Campground A Updated")
      .numberOfNights(3)
      .hookups(Set.of("Electric","Water","Sewer"))
      .checkinTime(LocalTime.of(14,0))
      .checkoutTime(LocalTime.of(10,0))
      .amenities(Set.of("Trails","Water Access"))
      .services(Set.of("Laundry","Dump Station"))
      .codes("Lockbox: 4567")
      .build();

    StopResponse updatedStop = stopService.updateStop(createdStop.getId(),updateReq,"alice");

    assertEquals(Set.of("Electric","Water","Sewer"),updatedStop.getHookups());
    assertEquals(LocalTime.of(14,0),updatedStop.getCheckinTime());
    assertEquals(LocalTime.of(10,0),updatedStop.getCheckoutTime());
    assertEquals(Set.of("Trails","Water Access"),updatedStop.getAmenities());
    assertEquals(Set.of("Laundry","Dump Station"),updatedStop.getServices());
    assertEquals("Lockbox: 4567",updatedStop.getCodes());

    List<String> amenities = stopService.getAllAmenities();
    assertEquals(List.of("Trails","Water Access"),amenities);

    List<String> services = stopService.getAllServices();
    assertEquals(List.of("Dump Station","Laundry"),services);
  } //updateStop_withExtendedFields_updatesValuesAndExpandsCatalogs

  @Test
  void cloneStop_withExtendedFields_preservesAllFields () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("RV Trip")
        .startingDate(LocalDate.of(2026,8,1))
        .build(),
      "alice"
    );

    StopResponse sourceStop = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder()
        .name("State Park Site 1")
        .numberOfNights(2)
        .hookups(Set.of("Electric","Water","Sewer"))
        .checkinTime(LocalTime.of(15,30))
        .checkoutTime(LocalTime.of(11,30))
        .amenities(Set.of("Trails"))
        .services(Set.of("Propane"))
        .codes("Gate 5555")
        .build(),
      "alice"
    );

    CloneStopRequest cloneReq = CloneStopRequest.builder()
      .name("State Park Site 2")
      .numberOfNights(2)
      .hookups(Set.of("Electric","Water","Sewer"))
      .checkinTime(LocalTime.of(15,30))
      .checkoutTime(LocalTime.of(11,30))
      .amenities(Set.of("Trails","Fire Pit"))
      .services(Set.of("Propane","Ice"))
      .codes("Gate 7777")
      .build();

    StopResponse clonedStop = stopService.cloneStop(sourceStop.getId(),cloneReq,"alice");

    assertEquals("State Park Site 2",clonedStop.getName());
    assertEquals(Set.of("Electric","Water","Sewer"),clonedStop.getHookups());
    assertEquals(LocalTime.of(15,30),clonedStop.getCheckinTime());
    assertEquals(LocalTime.of(11,30),clonedStop.getCheckoutTime());
    assertEquals(Set.of("Trails","Fire Pit"),clonedStop.getAmenities());
    assertEquals(Set.of("Propane","Ice"),clonedStop.getServices());
    assertEquals("Gate 7777",clonedStop.getCodes());

    List<String> amenities = stopService.getAllAmenities();
    assertEquals(List.of("Fire Pit","Trails"),amenities);

    List<String> services = stopService.getAllServices();
    assertEquals(List.of("Ice","Propane"),services);
  } //cloneStop_withExtendedFields_preservesAllFields

  @Test
  void updateTask_updatesDescriptionAndEnforcesUserIsolation () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Task Edit Trip")
        .startingDate(LocalDate.of(2026,9,1))
        .build(),
      "alice"
    );

    TaskResponse task = taskService.addPreTripTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Original Task Description").build(),
      "alice"
    );

    UpdateTaskRequest updateReq = UpdateTaskRequest.builder()
      .description("Updated Task Description")
      .build();

    TaskResponse updated = taskService.updateTask(task.getId(),updateReq,"alice");
    assertEquals("Updated Task Description",updated.getDescription());

      // User isolation: bob cannot update alice's task
    assertThrows(ResourceNotFoundException.class,() -> taskService.updateTask(task.getId(),updateReq,"bob"));
  } //updateTask_updatesDescriptionAndEnforcesUserIsolation

  @Test
  void updateTask_stopTask_updatesDescriptionAndEnforcesUserIsolation () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Stop Task Trip")
        .startingDate(LocalDate.of(2026,9,1))
        .build(),
      "alice"
    );

    StopResponse stop = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Stop 1").build(),
      "alice"
    );

    TaskResponse task = taskService.addArrivalTask(
      stop.getId(),
      CreateTaskRequest.builder().description("Initial Arrival Task").build(),
      "alice"
    );

    UpdateTaskRequest updateReq = UpdateTaskRequest.builder()
      .description("Edited Arrival Task")
      .build();

    TaskResponse updated = taskService.updateTask(task.getId(),updateReq,"alice");
    assertEquals("Edited Arrival Task",updated.getDescription());

      // User isolation: bob cannot update alice's stop task
    assertThrows(ResourceNotFoundException.class,() -> taskService.updateTask(task.getId(),updateReq,"bob"));
  } //updateTask_stopTask_updatesDescriptionAndEnforcesUserIsolation

  @Test
  void multiUserCollaboration_addCollaboratorAndEnforceAccess () {
    userService.getOrCreateUser("alice","Alice");
    userService.getOrCreateUser("bob","Bob");
    userService.getOrCreateUser("charlie","Charlie");

    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Shared Camping Trip")
        .startingDate(LocalDate.of(2026,7,1))
        .build(),
      "alice"
    );

    assertEquals(1,trip.getUsers().size());
    assertEquals("alice",trip.getUsers().getFirst().getUsername());

      // Bob currently has no access
    assertThrows(ResourceNotFoundException.class,() -> tripService.getTripById(trip.getId(),"bob"));
    assertEquals(0,tripService.getUserTrips("bob").size());

      // Alice adds Bob as collaborator
    TripDetailResponse sharedTrip = tripService.addCollaborator(
      trip.getId(),
      AddTripUserRequest.builder().username("bob").build(),
      "alice"
    );

    assertEquals(2,sharedTrip.getUsers().size());

      // Bob can now view and manage trip
    TripDetailResponse bobsView = tripService.getTripById(trip.getId(),"bob");
    assertEquals("Shared Camping Trip",bobsView.getName());
    assertEquals(1,tripService.getUserTrips("bob").size());

      // Bob can add a stop and tasks
    StopResponse stop = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Bob's Chosen Stop").build(),
      "bob"
    );
    assertEquals("Bob's Chosen Stop",stop.getName());

    TaskResponse task = taskService.addPreTripTask(
      trip.getId(),
      CreateTaskRequest.builder().description("Bob's pre-trip task").build(),
      "bob"
    );
    assertEquals("Bob's pre-trip task",task.getDescription());

      // Charlie still has no access
    assertThrows(ResourceNotFoundException.class,() -> tripService.getTripById(trip.getId(),"charlie"));
  } //multiUserCollaboration_addCollaboratorAndEnforceAccess

  @Test
  void removeCollaborator_removesAccessAndProtectsLastCollaborator () {
    userService.getOrCreateUser("alice","Alice");
    userService.getOrCreateUser("bob","Bob");

    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Multi-User Trip")
        .startingDate(LocalDate.of(2026,8,1))
        .build(),
      "alice"
    );

    tripService.addCollaborator(
      trip.getId(),
      AddTripUserRequest.builder().username("bob").build(),
      "alice"
    );

      // Remove Bob
    TripDetailResponse updated = tripService.removeCollaborator(trip.getId(),"bob","alice");
    assertEquals(1,updated.getUsers().size());
    assertEquals("alice",updated.getUsers().getFirst().getUsername());

      // Bob can no longer access
    assertThrows(ResourceNotFoundException.class,() -> tripService.getTripById(trip.getId(),"bob"));

      // Attempting to remove Alice (the last collaborator) fails
    assertThrows(BadRequestException.class,() -> tripService.removeCollaborator(trip.getId(),"alice","alice"));
  } //removeCollaborator_removesAccessAndProtectsLastCollaborator

  @Test
  void reorderStops_updatesOrderIndicesAndRecalculatesDates () {
    TripDetailResponse trip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Pacific Coast Tour")
        .startingDate(LocalDate.of(2026,6,1))
        .build(),
      "alice"
    );

    StopResponse stop1 = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Seattle").numberOfNights(2).build(),
      "alice"
    );
    StopResponse stop2 = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("Portland").numberOfNights(3).build(),
      "alice"
    );
    StopResponse stop3 = stopService.addStop(
      trip.getId(),
      CreateStopRequest.builder().name("San Francisco").numberOfNights(4).build(),
      "alice"
    );

    TripDetailResponse initialTrip = tripService.getTripById(trip.getId(),"alice");
    assertEquals(3,initialTrip.getStops().size());
    assertEquals("Seattle",initialTrip.getStops().getFirst().getName());
    assertEquals(LocalDate.of(2026,6,1),initialTrip.getStops().get(0).getStopDate());
    assertEquals(0,initialTrip.getStops().get(0).getOrderIndex());

    assertEquals("Portland",initialTrip.getStops().get(1).getName());
    assertEquals(LocalDate.of(2026,6,3),initialTrip.getStops().get(1).getStopDate());
    assertEquals(1,initialTrip.getStops().get(1).getOrderIndex());

    assertEquals("San Francisco",initialTrip.getStops().get(2).getName());
    assertEquals(LocalDate.of(2026,6,6),initialTrip.getStops().get(2).getStopDate());
    assertEquals(2,initialTrip.getStops().get(2).getOrderIndex());
    assertEquals(LocalDate.of(2026,6,10),initialTrip.getEndingDate());

      // Reorder: Move San Francisco to first position [stop3, stop1, stop2]
    stopService.reorderStops(List.of(stop3.getId(),stop1.getId(),stop2.getId()),"alice");

    TripDetailResponse reorderedTrip = tripService.getTripById(trip.getId(),"alice");
    assertEquals(3,reorderedTrip.getStops().size());

      // San Francisco is now index 0, starts June 1 (4 nights) -> ends June 5
    assertEquals("San Francisco",reorderedTrip.getStops().getFirst().getName());
    assertEquals(0,reorderedTrip.getStops().get(0).getOrderIndex());
    assertEquals(LocalDate.of(2026,6,1),reorderedTrip.getStops().get(0).getStopDate());

      // Seattle is now index 1, starts June 5 (2 nights) -> ends June 7
    assertEquals("Seattle",reorderedTrip.getStops().get(1).getName());
    assertEquals(1,reorderedTrip.getStops().get(1).getOrderIndex());
    assertEquals(LocalDate.of(2026,6,5),reorderedTrip.getStops().get(1).getStopDate());

      // Portland is now index 2, starts June 7 (3 nights) -> ends June 10
    assertEquals("Portland",reorderedTrip.getStops().get(2).getName());
    assertEquals(2,reorderedTrip.getStops().get(2).getOrderIndex());
    assertEquals(LocalDate.of(2026,6,7),reorderedTrip.getStops().get(2).getStopDate());

    assertEquals(LocalDate.of(2026,6,10),reorderedTrip.getEndingDate());

      // User isolation check: Bob cannot reorder Alice's trip stops
    assertThrows(ResourceNotFoundException.class,() ->
      stopService.reorderStops(List.of(stop1.getId(),stop2.getId(),stop3.getId()),"bob")
    );
  } //reorderStops_updatesOrderIndicesAndRecalculatesDates

  @Test
  void cloneTrip_duplicatesChecklistsAndStopsWithIncompleteStatusAndNewDates () {
    TripDetailResponse sourceTrip = tripService.createTrip(
      CreateTripRequest.builder()
        .name("Original Adventure")
        .startingDate(LocalDate.of(2026,7,1))
        .build(),
      "alice"
    );

    TaskResponse preTask1 = taskService.addPreTripTask(
      sourceTrip.getId(),
      CreateTaskRequest.builder().description("Pack sleeping bags").build(),
      "alice"
    );
    TaskResponse ignored = taskService.addPreTripTask(
      sourceTrip.getId(),
      CreateTaskRequest.builder().description("Buy groceries").build(),
      "alice"
    );
    taskService.updateTaskStatus(preTask1.getId(),UpdateTaskStatusRequest.builder().status(TaskStatus.COMPLETED).build(),"alice");

    TaskResponse depTask = taskService.addDepartureDayTask(
      sourceTrip.getId(),
      CreateTaskRequest.builder().description("Check tire pressure").build(),
      "alice"
    );
    taskService.updateTaskStatus(depTask.getId(),UpdateTaskStatusRequest.builder().status(TaskStatus.COMPLETED).build(),"alice");

    TaskResponse ignoredTask = taskService.addReturnDayTask(
      sourceTrip.getId(),
      CreateTaskRequest.builder().description("Unpack gear").build(),
      "alice"
    );

    StopResponse stop1 = stopService.addStop(
      sourceTrip.getId(),
      CreateStopRequest.builder()
        .name("Campground A")
        .location("Mountain View")
        .numberOfNights(2)
        .webAddress("https://campa.com")
        .telephoneNumber("555-1111")
        .confirmationCode("CONF-A")
        .siteNumber("Site 12")
        .notes("Near the creek")
        .hookups(Set.of("Electric","Water"))
        .checkinTime(LocalTime.of(14,0))
        .checkoutTime(LocalTime.of(11,0))
        .amenities(Set.of("Trails","River Access"))
        .services(Set.of("Firewood"))
        .codes("GATE-1234")
        .build(),
      "alice"
    );

    TaskResponse arrTask = taskService.addArrivalTask(
      stop1.getId(),
      CreateTaskRequest.builder().description("Level the rig").build(),
      "alice"
    );
    taskService.updateTaskStatus(arrTask.getId(),UpdateTaskStatusRequest.builder().status(TaskStatus.COMPLETED).build(),"alice");

    TaskResponse ignoredDepartureTask = taskService.addDepartureTask(
      stop1.getId(),
      CreateTaskRequest.builder().description("Disconnect hoses").build(),
      "alice"
    );

    StopResponse stop2 = stopService.addStop(
      sourceTrip.getId(),
      CreateStopRequest.builder()
        .name("Campground B")
        .location("Lakeside")
        .numberOfNights(3)
        .build(),
      "alice"
    );

      // Clone trip to start on June 1, 2027
    TripDetailResponse clonedTrip = tripService.cloneTrip(
      sourceTrip.getId(),
      CloneTripRequest.builder()
        .name("Cloned Adventure 2027")
        .startingDate(LocalDate.of(2027,6,1))
        .build(),
      "alice"
    );

    assertNotNull(clonedTrip.getId());
    Assertions.assertNotEquals(sourceTrip.getId(),clonedTrip.getId());
    assertEquals("Cloned Adventure 2027",clonedTrip.getName());
    assertEquals(LocalDate.of(2027,6,1),clonedTrip.getStartingDate());
    assertEquals(LocalDate.of(2027,6,6),clonedTrip.getEndingDate());
    assertEquals(1,clonedTrip.getUsers().size());
    assertEquals("alice",clonedTrip.getUsers().getFirst().getUsername());

      // Check Pre-Trip tasks
    assertEquals(2,clonedTrip.getPreTripTasks().size());
    assertEquals("Pack sleeping bags",clonedTrip.getPreTripTasks().get(0).getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedTrip.getPreTripTasks().get(0).getStatus());
    assertEquals("Buy groceries",clonedTrip.getPreTripTasks().get(1).getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedTrip.getPreTripTasks().get(1).getStatus());

      // Check Departure Day tasks
    assertEquals(1,clonedTrip.getDepartureDayTasks().size());
    assertEquals("Check tire pressure",clonedTrip.getDepartureDayTasks().getFirst().getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedTrip.getDepartureDayTasks().getFirst().getStatus());

      // Check Return Day tasks
    assertEquals(1,clonedTrip.getReturnDayTasks().size());
    assertEquals("Unpack gear",clonedTrip.getReturnDayTasks().getFirst().getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedTrip.getReturnDayTasks().getFirst().getStatus());

      // Check Stops
    assertEquals(2,clonedTrip.getStops().size());

    StopResponse clonedStop1 = clonedTrip.getStops().getFirst();
    Assertions.assertNotEquals(stop1.getId(),clonedStop1.getId());
    assertEquals("Campground A",clonedStop1.getName());
    assertEquals("Mountain View",clonedStop1.getLocation());
    assertEquals(2,clonedStop1.getNumberOfNights());
    assertEquals(LocalDate.of(2027,6,1),clonedStop1.getStopDate());
    assertEquals("https://campa.com",clonedStop1.getWebAddress());
    assertEquals("555-1111",clonedStop1.getTelephoneNumber());
    assertEquals("CONF-A",clonedStop1.getConfirmationCode());
    assertEquals("Site 12",clonedStop1.getSiteNumber());
    assertEquals("Near the creek",clonedStop1.getNotes());
    assertEquals(Set.of("Electric","Water"),clonedStop1.getHookups());
    assertEquals(LocalTime.of(14,0),clonedStop1.getCheckinTime());
    assertEquals(LocalTime.of(11,0),clonedStop1.getCheckoutTime());
    assertEquals(Set.of("Trails","River Access"),clonedStop1.getAmenities());
    assertEquals(Set.of("Firewood"),clonedStop1.getServices());
    assertEquals("GATE-1234",clonedStop1.getCodes());

      // Check Stop 1 Tasks (must be INCOMPLETE)
    assertEquals(1,clonedStop1.getArrivalTasks().size());
    assertEquals("Level the rig",clonedStop1.getArrivalTasks().getFirst().getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedStop1.getArrivalTasks().getFirst().getStatus());

    assertEquals(1,clonedStop1.getDepartureTasks().size());
    assertEquals("Disconnect hoses",clonedStop1.getDepartureTasks().getFirst().getDescription());
    assertEquals(TaskStatus.INCOMPLETE,clonedStop1.getDepartureTasks().getFirst().getStatus());

    StopResponse clonedStop2 = clonedTrip.getStops().get(1);
    Assertions.assertNotEquals(stop2.getId(),clonedStop2.getId());
    assertEquals("Campground B",clonedStop2.getName());
    assertEquals("Lakeside",clonedStop2.getLocation());
    assertEquals(3,clonedStop2.getNumberOfNights());
    assertEquals(LocalDate.of(2027,6,3),clonedStop2.getStopDate());

      // User isolation check: Unauthorized user cannot clone
    assertThrows(ResourceNotFoundException.class,() ->
      tripService.cloneTrip(
        sourceTrip.getId(),
        CloneTripRequest.builder().name("Unauthorized Clone").startingDate(LocalDate.of(2027,1,1)).build(),
        "bob"
      )
    );
  } //cloneTrip_duplicatesChecklistsAndStopsWithIncompleteStatusAndNewDates

} //*TripServiceTest
