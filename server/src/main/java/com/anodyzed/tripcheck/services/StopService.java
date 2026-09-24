package com.anodyzed.tripcheck.services;

import com.anodyzed.tripcheck.dto.CreateStopRequest;
import com.anodyzed.tripcheck.dto.StopResponse;
import com.anodyzed.tripcheck.model.Stop;
import com.anodyzed.tripcheck.model.Trip;
import com.anodyzed.tripcheck.repository.StopRepository;
import com.anodyzed.tripcheck.repository.TripRepository;
import com.anodyzed.tripcheck.util.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StopService {

  private final StopRepository stopRepository;
  private final TripService tripService;
  private final TripRepository tripRepository;

  public StopService (StopRepository stopRepository,TripService tripService,TripRepository tripRepository) {
    this.stopRepository = stopRepository;
    this.tripService = tripService;
    this.tripRepository = tripRepository;
  } //StopService

  public StopResponse addStop (Long tripId,CreateStopRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);

    Stop stop = Stop.builder()
      .name(request.getName())
      .location(request.getLocation())
      .numberOfNights(request.getNumberOfNights() != null ? request.getNumberOfNights() : 1)
      .webAddress(request.getWebAddress())
      .telephoneNumber(request.getTelephoneNumber())
      .confirmationCode(request.getConfirmationCode())
      .siteNumber(request.getSiteNumber())
      .notes(request.getNotes())
      .build();

    trip.addStop(stop);
    return StopResponse.fromEntity(tripRepository.save(trip).getStops().getLast());
  } //addStop

  @Transactional(readOnly=true)
  public StopResponse getStopById (Long stopId,String userId) {
    return StopResponse.fromEntity(getStopEntity(stopId,userId));
  } //getStopById

  public void deleteStop (Long stopId,String userId) {
    Stop stop = getStopEntity(stopId,userId);
    Trip trip = stop.getTrip();
    if(trip != null) {
      trip.getStops().remove(stop);
      trip.recalculateDates();
      tripRepository.save(trip);
    } else {
      stopRepository.delete(stop);
    }
  } //deleteStop

  public Stop getStopEntity (Long stopId,String userId) {
    Stop stop = stopRepository.findById(stopId)
      .orElseThrow(() -> new ResourceNotFoundException("Stop not found with id: " + stopId));
    if(stop.getTrip() != null) {
      tripService.getTripEntity(stop.getTrip().getId(),userId);
    }
    return stop;
  } //getStopEntity

} //*StopService
