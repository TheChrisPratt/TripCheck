package com.anodyzed.tripcheck.security.webauthn.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationFinishRequest {
  @NotBlank(message="Username is required")
  private String username;

  private String credentialId;
  private Map<String,Object> credential;

} //*RegistrationFinishRequest
