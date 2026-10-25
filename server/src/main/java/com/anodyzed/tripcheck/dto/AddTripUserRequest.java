package com.anodyzed.tripcheck.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddTripUserRequest {

  @NotBlank(message="Username is required")
  private String username;

} //*AddTripUserRequest
