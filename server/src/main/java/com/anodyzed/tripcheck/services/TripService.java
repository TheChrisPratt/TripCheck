package com.anodyzed.tripcheck.services;

import com.anodyzed.tripcheck.dto.CreateTripRequest;
import com.anodyzed.tripcheck.dto.TripDetailResponse;
import com.anodyzed.tripcheck.dto.TripSummaryResponse;
import com.anodyzed.tripcheck.model.Trip;
import com.anodyzed.tripcheck.repository.TripRepository;
import com.anodyzed.tripcheck.util.exception.ResourceNotFoundException;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TripService {

  private final TripRepository tripRepository;

  public TripService (TripRepository tripRepository) {
    this.tripRepository = tripRepository;
  } //TripService

  public TripDetailResponse createTrip (CreateTripRequest request,String userId) {
    Trip trip = Trip.builder()
      .name(request.getName())
      .startingDate(request.getStartingDate())
      .endingDate(request.getStartingDate())
      .userId(userId)
      .build();
    Trip saved = tripRepository.save(trip);
    return TripDetailResponse.fromEntity(saved);
  } //createTrip

  @Transactional(readOnly=true)
  public List<TripSummaryResponse> getUserTrips (String userId) {
    List<Trip> trips;
    if(userId != null && !userId.isBlank()) {
      trips = tripRepository.findByUserIdOrderByStartingDateAsc(userId);
    } else {
      trips = tripRepository.findAll();
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

  public Trip getTripEntity (Long id,String userId) {
    Trip trip = tripRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    if(userId != null && trip.getUserId() != null && !trip.getUserId().equals(userId)) {
      throw new ResourceNotFoundException("Trip not found with id: " + id);
    }
    return trip;
  } //getTripEntity

} //*TripService
