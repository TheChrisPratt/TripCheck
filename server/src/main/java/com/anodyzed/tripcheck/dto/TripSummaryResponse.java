package com.anodyzed.tripcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.model.Trip;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripSummaryResponse {
  private Long id;
  private String name;
  private LocalDate startingDate;
  private LocalDate endingDate;
  private int stopCount;
  private int totalTaskCount;
  private int completedTaskCount;

  public static TripSummaryResponse fromEntity (Trip trip) {
    if(trip == null) {
      return null;
    }

    int stops = trip.getStops() != null ? trip.getStops().size() : 0;
    int tripTasks = trip.getTasks() != null ? trip.getTasks().size() : 0;
    int stopTasks = 0;
    int completedTripTasks = 0;
    int completedStopTasks = 0;

    if(trip.getTasks() != null) {
      completedTripTasks = (int)trip.getTasks().stream()
        .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
        .count();
    }

    if(trip.getStops() != null) {
      for(var stop : trip.getStops()) {
        if(stop.getTasks() != null) {
          stopTasks += stop.getTasks().size();
          completedStopTasks += (int)stop.getTasks().stream()
            .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
            .count();
        }
      }
    }

    return TripSummaryResponse.builder()
      .id(trip.getId())
      .name(trip.getName())
      .startingDate(trip.getStartingDate())
      .endingDate(trip.getEndingDate())
      .stopCount(stops)
      .totalTaskCount(tripTasks + stopTasks)
      .completedTaskCount(completedTripTasks + completedStopTasks)
      .build();
  } //fromEntity

} //*TripSummaryResponse
