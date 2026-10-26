package com.anodyzed.tripcheck.resources;

import jakarta.validation.Valid;

import com.anodyzed.tripcheck.dto.CloneStopRequest;
import com.anodyzed.tripcheck.dto.CreateTaskRequest;
import com.anodyzed.tripcheck.dto.ReorderStopsRequest;
import com.anodyzed.tripcheck.dto.StopResponse;
import com.anodyzed.tripcheck.dto.TaskResponse;
import com.anodyzed.tripcheck.dto.UpdateStopRequest;
import com.anodyzed.tripcheck.services.StopService;
import com.anodyzed.tripcheck.services.TaskService;

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

import java.util.List;

@RestController
@RequestMapping("/api/stops")
public class StopResource {

  private final StopService stopService;
  private final TaskService taskService;

  public StopResource (StopService stopService,TaskService taskService) {
    this.stopService = stopService;
    this.taskService = taskService;
  } //StopResource

  private String getUserId (Authentication authentication) {
    return authentication != null ? authentication.getName() : null;
  } //getUserId

  @GetMapping("/amenities")
  public ResponseEntity<List<String>> getAmenities () {
    return ResponseEntity.ok(stopService.getAllAmenities());
  } //getAmenities

  @GetMapping("/services")
  public ResponseEntity<List<String>> getServices () {
    return ResponseEntity.ok(stopService.getAllServices());
  } //getServices

  @GetMapping("/{stopId}")
  public ResponseEntity<StopResponse> getStop (
    @PathVariable Long stopId,
    Authentication authentication) {
    StopResponse stop = stopService.getStopById(stopId,getUserId(authentication));
    return ResponseEntity.ok(stop);
  } //getStop

  @PutMapping("/{stopId}")
  public ResponseEntity<StopResponse> updateStop (
    @PathVariable Long stopId,
    @Valid @RequestBody UpdateStopRequest request,
    Authentication authentication) {
    StopResponse stop = stopService.updateStop(stopId,request,getUserId(authentication));
    return ResponseEntity.ok(stop);
  } //updateStop

  @PostMapping("/{stopId}/clone")
  public ResponseEntity<StopResponse> cloneStop (
    @PathVariable Long stopId,
    @Valid @RequestBody CloneStopRequest request,
    Authentication authentication) {
    StopResponse stop = stopService.cloneStop(stopId,request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(stop);
  } //cloneStop

  @DeleteMapping("/{stopId}")
  public ResponseEntity<Void> deleteStop (
    @PathVariable Long stopId,
    Authentication authentication) {
    stopService.deleteStop(stopId,getUserId(authentication));
    return ResponseEntity.noContent().build();
  } //deleteStop

  @PutMapping("/reorder")
  public ResponseEntity<Void> reorderStops (
    @Valid @RequestBody ReorderStopsRequest request,
    Authentication authentication) {
    stopService.reorderStops(request.getStopIds(),getUserId(authentication));
    return ResponseEntity.noContent().build();
  } //reorderStops

  @PostMapping("/{stopId}/tasks/arrival")
  public ResponseEntity<TaskResponse> addArrivalTask (
    @PathVariable Long stopId,
    @Valid @RequestBody CreateTaskRequest request,
    Authentication authentication) {
    TaskResponse task = taskService.addArrivalTask(stopId,request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(task);
  } //addArrivalTask

  @PostMapping("/{stopId}/tasks/departure")
  public ResponseEntity<TaskResponse> addDepartureTask (
    @PathVariable Long stopId,
    @Valid @RequestBody CreateTaskRequest request,
    Authentication authentication) {
    TaskResponse task = taskService.addDepartureTask(stopId,request,getUserId(authentication));
    return ResponseEntity.status(HttpStatus.CREATED).body(task);
  } //addDepartureTask

} //*StopResource
