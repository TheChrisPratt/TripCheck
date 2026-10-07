package com.anodyzed.tripcheck.resources;

import jakarta.validation.Valid;

import com.anodyzed.tripcheck.dto.CreateStopRequest;
import com.anodyzed.tripcheck.dto.CreateTaskRequest;
import com.anodyzed.tripcheck.dto.CreateTripRequest;
import com.anodyzed.tripcheck.dto.StopResponse;
import com.anodyzed.tripcheck.dto.TaskResponse;
import com.anodyzed.tripcheck.dto.TripDetailResponse;
import com.anodyzed.tripcheck.dto.TripSummaryResponse;
import com.anodyzed.tripcheck.dto.UpdateTripRequest;
import com.anodyzed.tripcheck.services.StopService;
import com.anodyzed.tripcheck.services.TaskService;
import com.anodyzed.tripcheck.services.TripService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips")
public class TripResource {

  private final TripService tripService;
  private final StopService stopService;
  private final TaskService taskService;

  public TripResource (TripService tripService,StopService stopService,TaskService taskService) {
    this.tripService = tripService;
    this.stopService = stopService;
    this.taskService = taskService;
  }

  private String getUserId (Authentication authentication) {
    return authentication != null ? authentication.getName() : null;
  } //getUserId

  @PostMapping
  public ResponseEntity<TripDetailResponse> createTrip (
    @Valid @RequestBody CreateTripRequest request,
    Authentication authentication) {
    TripDetailResponse response = tripService.createTrip(request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  } //createTrip

  @GetMapping
  public ResponseEntity<List<TripSummaryResponse>> listTrips (Authentication authentication) {
    List<TripSummaryResponse> trips = tripService.getUserTrips(getUserId(authentication));
    return ResponseEntity.ok(trips);
  } //listTrips

  @GetMapping("/{id}")
  public ResponseEntity<TripDetailResponse> getTrip (
    @PathVariable Long id,
    Authentication authentication) {
    TripDetailResponse trip = tripService.getTripById(id,getUserId(authentication));
    return ResponseEntity.ok(trip);
  } //getTrip

  @PutMapping("/{id}")
  public ResponseEntity<TripDetailResponse> updateTrip (
    @PathVariable Long id,
    @Valid @RequestBody UpdateTripRequest request,
    Authentication authentication) {
    TripDetailResponse trip = tripService.updateTrip(id,request,getUserId(authentication));
    return ResponseEntity.ok(trip);
  } //updateTrip

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTrip (
    @PathVariable Long id,
    Authentication authentication) {
    tripService.deleteTrip(id,getUserId(authentication));
    return ResponseEntity.noContent().build();
  } //deleteTrip

  @PostMapping("/{tripId}/stops")
  public ResponseEntity<StopResponse> addStop (
    @PathVariable Long tripId,
    @Valid @RequestBody CreateStopRequest request,
    Authentication authentication) {
    StopResponse stop = stopService.addStop(tripId,request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(stop);
  } //addStop

  @PostMapping("/{tripId}/tasks/pre-trip")
  public ResponseEntity<TaskResponse> addPreTripTask (
    @PathVariable Long tripId,
    @Valid @RequestBody CreateTaskRequest request,
    Authentication authentication) {
    TaskResponse task = taskService.addPreTripTask(tripId,request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(task);
  } //addPreTripTask

  @PostMapping("/{tripId}/tasks/departure-day")
  public ResponseEntity<TaskResponse> addDepartureDayTask (
    @PathVariable Long tripId,
    @Valid @RequestBody CreateTaskRequest request,
    Authentication authentication) {
    TaskResponse task = taskService.addDepartureDayTask(tripId,request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(task);
  } //addDepartureDayTask

  @PostMapping("/{tripId}/tasks/return-day")
  public ResponseEntity<TaskResponse> addReturnDayTask (
    @PathVariable Long tripId,
    @Valid @RequestBody CreateTaskRequest request,
    Authentication authentication) {
    TaskResponse task = taskService.addReturnDayTask(tripId,request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(task);
  } //addReturnDayTask

} //*TripResource
