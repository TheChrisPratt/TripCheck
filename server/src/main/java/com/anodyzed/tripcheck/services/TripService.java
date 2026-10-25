package com.anodyzed.tripcheck.services;

import com.anodyzed.tripcheck.dto.AddTripUserRequest;
import com.anodyzed.tripcheck.dto.CreateTripRequest;
import com.anodyzed.tripcheck.dto.TripDetailResponse;
import com.anodyzed.tripcheck.dto.TripSummaryResponse;
import com.anodyzed.tripcheck.dto.UpdateTripRequest;
import com.anodyzed.tripcheck.model.Trip;
import com.anodyzed.tripcheck.model.User;
import com.anodyzed.tripcheck.repository.TripRepository;
import com.anodyzed.tripcheck.util.exception.BadRequestException;
import com.anodyzed.tripcheck.util.exception.ResourceNotFoundException;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TripService {

  private final TripRepository tripRepository;
  private final UserService userService;

  public TripService (TripRepository tripRepository,UserService userService) {
    this.tripRepository = tripRepository;
    this.userService = userService;
  } //TripService

  public TripDetailResponse createTrip (CreateTripRequest request,String userId) {
    Trip trip = Trip.builder()
      .name(request.getName())
      .startingDate(request.getStartingDate())
      .endingDate(request.getStartingDate())
      .build();

    if(userId != null && !userId.isBlank()) {
      User user = userService.getOrCreateUser(userId,null);
      if(user != null) {
        trip.addUser(user);
      }
    }

    Trip saved = tripRepository.save(trip);
    return TripDetailResponse.fromEntity(saved);
  } //createTrip

  public TripDetailResponse updateTrip (Long id,UpdateTripRequest request,String userId) {
    Trip trip = getTripEntity(id,userId);
    trip.setName(request.getName());
    trip.setStartingDate(request.getStartingDate());
    trip.recalculateDates();
    Trip saved = tripRepository.save(trip);
    return TripDetailResponse.fromEntity(saved);
  } //updateTrip

  @Transactional(readOnly=true)
  public List<TripSummaryResponse> getUserTrips (String userId) {
    List<Trip> trips;
    if(userId != null && !userId.isBlank()) {
      trips = tripRepository.findByUsers_UsernameIgnoreCaseOrderByStartingDateAsc(userId.trim());
    } else {
      trips = tripRepository.findAllByOrderByStartingDateAsc();
    }
    return trips.stream().map(TripSummaryResponse::fromEntity).toList();
  } //getUserTrips

  @Transactional(readOnly=true)
  public TripDetailResponse getTripById (Long id,String userId) {
    Trip trip = getTripEntity(id,userId);
    return TripDetailResponse.fromEntity(trip);
  } //getTripById

  public void deleteTrip (Long id,String userId) {
    Trip trip = getTripEntity(id,userId);
    tripRepository.delete(trip);
  } //deleteTrip

  public TripDetailResponse addCollaborator (Long tripId,AddTripUserRequest request,String userId) {
    Trip trip = getTripEntity(tripId,userId);
    String usernameToAdd = request.getUsername().trim().toLowerCase();
    User user = userService.getUserByUsername(usernameToAdd);
    if(user == null) {
      throw new ResourceNotFoundException("User not found: " + usernameToAdd);
    }
    trip.addUser(user);
    Trip saved = tripRepository.save(trip);
    return TripDetailResponse.fromEntity(saved);
  } //addCollaborator

  public TripDetailResponse removeCollaborator (Long tripId,String usernameToRemove,String userId) {
    Trip trip = getTripEntity(tripId,userId);
    String normalized = usernameToRemove.trim().toLowerCase();
    User user = userService.getUserByUsername(normalized);
    if(user == null || !trip.hasUser(normalized)) {
      throw new ResourceNotFoundException("User not found on trip: " + usernameToRemove);
    }
    if(trip.getUsers() != null && trip.getUsers().size() <= 1) {
      throw new BadRequestException("Cannot remove the last collaborator from the trip");
    }
    trip.removeUser(user);
    Trip saved = tripRepository.save(trip);
    return TripDetailResponse.fromEntity(saved);
  } //removeCollaborator

  public Trip getTripEntity (Long id,String userId) {
    Trip trip = tripRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    if(userId != null && !userId.isBlank() && !trip.hasUser(userId)) {
      throw new ResourceNotFoundException("Trip not found with id: " + id);
    }
    return trip;
  } //getTripEntity

} //*TripService
