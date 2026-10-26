package com.anodyzed.tripcheck.services;

import com.anodyzed.tripcheck.dto.CloneStopRequest;
import com.anodyzed.tripcheck.dto.CreateStopRequest;
import com.anodyzed.tripcheck.dto.StopResponse;
import com.anodyzed.tripcheck.dto.UpdateStopRequest;
import com.anodyzed.tripcheck.model.Amenity;
import com.anodyzed.tripcheck.model.Stop;
import com.anodyzed.tripcheck.model.StopServiceCatalog;
import com.anodyzed.tripcheck.model.Task;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.model.Trip;
import com.anodyzed.tripcheck.repository.AmenityRepository;
import com.anodyzed.tripcheck.repository.StopRepository;
import com.anodyzed.tripcheck.repository.StopServiceCatalogRepository;
import com.anodyzed.tripcheck.repository.TripRepository;
import com.anodyzed.tripcheck.util.exception.ResourceNotFoundException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StopService {

  private final StopRepository stopRepository;
  private final TripService tripService;
  private final TripRepository tripRepository;
  private final AmenityRepository amenityRepository;
  private final StopServiceCatalogRepository stopServiceCatalogRepository;

  public StopService (
    StopRepository stopRepository,
    TripService tripService,
    TripRepository tripRepository,
    AmenityRepository amenityRepository,
    StopServiceCatalogRepository stopServiceCatalogRepository
  ) {
    this.stopRepository = stopRepository;
    this.tripService = tripService;
    this.tripRepository = tripRepository;
    this.amenityRepository = amenityRepository;
    this.stopServiceCatalogRepository = stopServiceCatalogRepository;
  } //StopService

  private void registerAmenities (Set<String> amenities) {
    if(amenities == null || amenities.isEmpty()) {
      return;
    }
    for(String raw : amenities) {
      if(raw != null) {
        String trimmed = raw.trim();
        if(!trimmed.isEmpty() && !amenityRepository.existsByNameIgnoreCase(trimmed)) {
          amenityRepository.save(new Amenity(trimmed));
        }
      }
    }
  } //registerAmenities

  private void registerServices (Set<String> services) {
    if(services == null || services.isEmpty()) {
      return;
    }
    for(String raw : services) {
      if(raw != null) {
        String trimmed = raw.trim();
        if(!trimmed.isEmpty() && !stopServiceCatalogRepository.existsByNameIgnoreCase(trimmed)) {
          stopServiceCatalogRepository.save(new StopServiceCatalog(trimmed));
        }
      }
    }
  } //registerServices

  @Transactional(readOnly=true)
  public List<String> getAllAmenities () {
    return amenityRepository.findAllByOrderByNameAsc().stream()
      .map(Amenity::getName)
      .toList();
  } //getAllAmenities

  @Transactional(readOnly=true)
  public List<String> getAllServices () {
    return stopServiceCatalogRepository.findAllByOrderByNameAsc().stream()
      .map(StopServiceCatalog::getName)
      .toList();
  } //getAllServices

  public StopResponse addStop (Long tripId,CreateStopRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);

    registerAmenities(request.getAmenities());
    registerServices(request.getServices());

    Stop stop = Stop.builder()
      .name(request.getName())
      .location(request.getLocation())
      .numberOfNights(request.getNumberOfNights() != null ? request.getNumberOfNights() : 1)
      .webAddress(request.getWebAddress())
      .telephoneNumber(request.getTelephoneNumber())
      .confirmationCode(request.getConfirmationCode())
      .siteNumber(request.getSiteNumber())
      .notes(request.getNotes())
      .hookups(request.getHookups() != null ? new HashSet<>(request.getHookups()) : new HashSet<>())
      .checkinTime(request.getCheckinTime())
      .checkoutTime(request.getCheckoutTime())
      .amenities(request.getAmenities() != null ? new HashSet<>(request.getAmenities()) : new HashSet<>())
      .services(request.getServices() != null ? new HashSet<>(request.getServices()) : new HashSet<>())
      .codes(request.getCodes())
      .build();

    trip.addStop(stop);
    return StopResponse.fromEntity(tripRepository.save(trip).getStops().getLast());
  } //addStop

  public StopResponse updateStop (Long stopId,UpdateStopRequest request,String userId) {
    Stop stop = getStopEntity(stopId,userId);

    registerAmenities(request.getAmenities());
    registerServices(request.getServices());

    stop.setName(request.getName());
    stop.setLocation(request.getLocation());
    stop.setNumberOfNights(request.getNumberOfNights() != null ? request.getNumberOfNights() : 1);
    stop.setWebAddress(request.getWebAddress());
    stop.setTelephoneNumber(request.getTelephoneNumber());
    stop.setConfirmationCode(request.getConfirmationCode());
    stop.setSiteNumber(request.getSiteNumber());
    stop.setNotes(request.getNotes());
    stop.setHookups(request.getHookups() != null ? new HashSet<>(request.getHookups()) : new HashSet<>());
    stop.setCheckinTime(request.getCheckinTime());
    stop.setCheckoutTime(request.getCheckoutTime());
    stop.setAmenities(request.getAmenities() != null ? new HashSet<>(request.getAmenities()) : new HashSet<>());
    stop.setServices(request.getServices() != null ? new HashSet<>(request.getServices()) : new HashSet<>());
    stop.setCodes(request.getCodes());

    Trip trip = stop.getTrip();
    if(trip != null) {
      trip.recalculateDates();
      tripRepository.save(trip);
    } else {
      stopRepository.save(stop);
    }
    return StopResponse.fromEntity(stop);
  } //updateStop

  public StopResponse cloneStop (Long sourceStopId,CloneStopRequest request,String userId) {
    Stop sourceStop = getStopEntity(sourceStopId,userId);
    Trip trip = sourceStop.getTrip();
    if(trip == null) {
      throw new ResourceNotFoundException("Trip not found for stop id: " + sourceStopId);
    }

    registerAmenities(request.getAmenities());
    registerServices(request.getServices());

    Stop clonedStop = Stop.builder()
      .name(request.getName())
      .location(request.getLocation())
      .numberOfNights(request.getNumberOfNights() != null ? request.getNumberOfNights() : 1)
      .webAddress(request.getWebAddress())
      .telephoneNumber(request.getTelephoneNumber())
      .confirmationCode(request.getConfirmationCode())
      .siteNumber(request.getSiteNumber())
      .notes(request.getNotes())
      .stopDate(request.getStopDate())
      .hookups(request.getHookups() != null ? new HashSet<>(request.getHookups()) : (sourceStop.getHookups() != null ? new HashSet<>(sourceStop.getHookups()) : new HashSet<>()))
      .checkinTime(request.getCheckinTime() != null ? request.getCheckinTime() : sourceStop.getCheckinTime())
      .checkoutTime(request.getCheckoutTime() != null ? request.getCheckoutTime() : sourceStop.getCheckoutTime())
      .amenities(request.getAmenities() != null ? new HashSet<>(request.getAmenities()) : (sourceStop.getAmenities() != null ? new HashSet<>(sourceStop.getAmenities()) : new HashSet<>()))
      .services(request.getServices() != null ? new HashSet<>(request.getServices()) : (sourceStop.getServices() != null ? new HashSet<>(sourceStop.getServices()) : new HashSet<>()))
      .codes(request.getCodes() != null ? request.getCodes() : sourceStop.getCodes())
      .build();

    if(sourceStop.getTasks() != null) {
      for(Task sourceTask : sourceStop.getTasks()) {
        Task clonedTask = Task.builder()
          .description(sourceTask.getDescription())
          .category(sourceTask.getCategory())
          .status(TaskStatus.INCOMPLETE)
          .orderIndex(sourceTask.getOrderIndex())
          .stop(clonedStop)
          .build();
        clonedStop.getTasks().add(clonedTask);
      }
    }

    int targetIndex = (sourceStop.getOrderIndex() != null ? sourceStop.getOrderIndex() : 0) + 1;
    trip.addClonedStop(sourceStop,clonedStop);
    Trip savedTrip = tripRepository.save(trip);

    Stop savedClonedStop = savedTrip.getStops().stream()
      .filter(s -> s.getOrderIndex() != null && s.getOrderIndex() == targetIndex)
      .findFirst()
      .orElse(clonedStop);

    return StopResponse.fromEntity(savedClonedStop);
  } //cloneStop

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

  public void reorderStops (List<Long> stopIds,String userId) {
    if(stopIds != null && !stopIds.isEmpty()) {
      Stop firstStop = getStopEntity(stopIds.getFirst(),userId);
      Trip trip = firstStop.getTrip();
      if(trip != null) {
        tripService.getTripEntity(trip.getId(),userId);

        if(trip.getStops() != null) {
          for(int i = 0;i < stopIds.size();i++) {
            Long stopId = stopIds.get(i);
            for(Stop s : trip.getStops()) {
              if(s.getId() != null && s.getId().equals(stopId)) {
                s.setOrderIndex(i);
                break;
              }
            }
          }
          trip.recalculateDates();
          tripRepository.save(trip);
        }
      }
    }
  } //reorderStops

  public Stop getStopEntity (Long stopId,String userId) {
    Stop stop = stopRepository.findById(stopId)
      .orElseThrow(() -> new ResourceNotFoundException("Stop not found with id: " + stopId));
    if(stop.getTrip() != null) {
      tripService.getTripEntity(stop.getTrip().getId(),userId);
    }
    return stop;
  } //getStopEntity

} //*StopService
