package com.anodyzed.tripcheck.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTripRequest {

  @NotBlank(message="Trip name is required")
  private String name;

  @NotNull(message="Starting date is required")
  private LocalDate startingDate;

} //*UpdateTripRequest
