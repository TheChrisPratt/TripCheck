package com.anodyzed.tripcheck.security.webauthn;

import jakarta.validation.Valid;

import com.anodyzed.tripcheck.security.webauthn.dto.AssertionFinishRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.AssertionStartRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.AuthResponse;
import com.anodyzed.tripcheck.security.webauthn.dto.RegistrationFinishRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.RegistrationStartRequest;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class WebAuthnController {

  private final WebAuthnService webAuthnService;

  public WebAuthnController (WebAuthnService webAuthnService) {
    this.webAuthnService = webAuthnService;
  } //WebAuthnController

  @PostMapping("/webauthn/register-request")
  public ResponseEntity<Map<String,Object>> startRegistration (@Valid @RequestBody RegistrationStartRequest request) {
    return ResponseEntity.ok(webAuthnService.startRegistration(request));
  } //startRegistration

  @PostMapping("/webauthn/register-finish")
  public ResponseEntity<AuthResponse> finishRegistration (@Valid @RequestBody RegistrationFinishRequest request) {
    return webAuthnService.finishRegistration(request);
  } //finishRegistration

  @PostMapping("/webauthn/login-request")
  public ResponseEntity<Map<String,Object>> startAssertion (@Valid @RequestBody AssertionStartRequest request) {
    return ResponseEntity.ok(webAuthnService.startAssertion(request));
  } //startAssertion

  @PostMapping("/webauthn/login-finish")
  public ResponseEntity<AuthResponse> finishAssertion (@Valid @RequestBody AssertionFinishRequest request) {
    return webAuthnService.finishAssertion(request);
  } //finishAssertion

  @PostMapping("/logout")
  public ResponseEntity<Void> logout () {
    return webAuthnService.logout();
  } //logout

  @GetMapping("/me")
  public ResponseEntity<Map<String,Object>> getCurrentUser (Authentication authentication) {
    if(authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.ok(Map.of("authenticated",false));
    }
    return ResponseEntity.ok(Map.of(
      "authenticated",true,
      "username",authentication.getName(),
      "authorities",authentication.getAuthorities()
    ));
  } //getCurrentUser

} //*WebAuthnController
