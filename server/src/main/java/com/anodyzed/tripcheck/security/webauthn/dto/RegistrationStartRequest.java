package com.anodyzed.tripcheck.security.webauthn.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationStartRequest {
  @NotBlank(message="Username is required")
  private String username;

  private String displayName;
} //*RegistrationStartRequest
