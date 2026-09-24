package com.anodyzed.tripcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.anodyzed.tripcheck.model.Trip;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDetailResponse {
  private Long id;
  private String name;
  private LocalDate startingDate;
  private LocalDate endingDate;
  private String userId;

  @Builder.Default
  private List<TaskResponse> preTripTasks = new ArrayList<>();

  @Builder.Default
  private List<TaskResponse> departureDayTasks = new ArrayList<>();

  @Builder.Default
  private List<TaskResponse> returnDayTasks = new ArrayList<>();

  @Builder.Default
  private List<StopResponse> stops = new ArrayList<>();

  public static TripDetailResponse fromEntity (Trip trip) {
    if(trip == null) {
      return null;
    }
    return TripDetailResponse.builder()
      .id(trip.getId())
      .name(trip.getName())
      .startingDate(trip.getStartingDate())
      .endingDate(trip.getEndingDate())
      .userId(trip.getUserId())
      .preTripTasks(trip.getPreTripTasks() != null
        ? trip.getPreTripTasks().stream().map(TaskResponse::fromEntity).toList()
        : new ArrayList<>())
      .departureDayTasks(trip.getDepartureDayTasks() != null
        ? trip.getDepartureDayTasks().stream().map(TaskResponse::fromEntity).toList()
        : new ArrayList<>())
      .returnDayTasks(trip.getReturnDayTasks() != null
        ? trip.getReturnDayTasks().stream().map(TaskResponse::fromEntity).toList()
        : new ArrayList<>())
      .stops(trip.getStops() != null
        ? trip.getStops().stream().map(StopResponse::fromEntity).toList()
        : new ArrayList<>())
      .build();
  } //fromEntity

} //*TripDetailResponse
