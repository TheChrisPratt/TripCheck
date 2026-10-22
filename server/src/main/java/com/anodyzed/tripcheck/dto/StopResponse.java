package com.anodyzed.tripcheck.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.anodyzed.tripcheck.model.Stop;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StopResponse {
  private Long id;
  private String name;
  private LocalDate stopDate;
  private String location;
  private Integer numberOfNights;
  private String webAddress;
  private String telephoneNumber;
  private String confirmationCode;
  private String siteNumber;
  private String notes;
  private Integer orderIndex;
  private Long tripId;

  @Builder.Default
  private Set<String> hookups = new HashSet<>();

  @JsonFormat(pattern="HH:mm")
  private LocalTime checkinTime;

  @JsonFormat(pattern="HH:mm")
  private LocalTime checkoutTime;

  @Builder.Default
  private Set<String> amenities = new HashSet<>();

  @Builder.Default
  private Set<String> services = new HashSet<>();

  private String codes;

  @Builder.Default
  private List<TaskResponse> arrivalTasks = new ArrayList<>();

  @Builder.Default
  private List<TaskResponse> departureTasks = new ArrayList<>();

  public static StopResponse fromEntity (Stop stop) {
    if(stop == null) {
      return null;
    }
    return StopResponse.builder()
      .id(stop.getId())
      .name(stop.getName())
      .stopDate(stop.getStopDate())
      .location(stop.getLocation())
      .numberOfNights(stop.getNumberOfNights())
      .webAddress(stop.getWebAddress())
      .telephoneNumber(stop.getTelephoneNumber())
      .confirmationCode(stop.getConfirmationCode())
      .siteNumber(stop.getSiteNumber())
      .notes(stop.getNotes())
      .orderIndex(stop.getOrderIndex())
      .tripId(stop.getTrip() != null ? stop.getTrip().getId() : null)
      .hookups(stop.getHookups() != null ? new HashSet<>(stop.getHookups()) : new HashSet<>())
      .checkinTime(stop.getCheckinTime())
      .checkoutTime(stop.getCheckoutTime())
      .amenities(stop.getAmenities() != null ? new HashSet<>(stop.getAmenities()) : new HashSet<>())
      .services(stop.getServices() != null ? new HashSet<>(stop.getServices()) : new HashSet<>())
      .codes(stop.getCodes())
      .arrivalTasks(stop.getArrivalTasks() != null
        ? stop.getArrivalTasks().stream().map(TaskResponse::fromEntity).toList()
        : new ArrayList<>())
      .departureTasks(stop.getDepartureTasks() != null
        ? stop.getDepartureTasks().stream().map(TaskResponse::fromEntity).toList()
        : new ArrayList<>())
      .build();
  } //fromEntity

} //*StopResponse
