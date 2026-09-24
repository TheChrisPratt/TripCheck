package com.anodyzed.tripcheck.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStopRequest {

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

} //*CreateStopRequest
