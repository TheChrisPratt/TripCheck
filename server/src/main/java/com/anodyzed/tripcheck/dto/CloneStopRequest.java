package com.anodyzed.tripcheck.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloneStopRequest {

  @NotBlank(message="Stop name is required")
  private String name;

  private String location;

  @Builder.Default
  @PositiveOrZero(message="Number of nights must be 0 or greater")
  private Integer numberOfNights = 1;

  private String webAddress;
  private String telephoneNumber;
  private String confirmationCode;
  private String siteNumber;
  private String notes;
  private LocalDate stopDate;

  private Set<String> hookups;

  @JsonFormat(pattern="HH:mm")
  private LocalTime checkinTime;

  @JsonFormat(pattern="HH:mm")
  private LocalTime checkoutTime;

  private Set<String> amenities;
  private Set<String> services;

  @Size(max=128, message="Codes cannot exceed 128 characters")
  private String codes;

} //*CloneStopRequest
