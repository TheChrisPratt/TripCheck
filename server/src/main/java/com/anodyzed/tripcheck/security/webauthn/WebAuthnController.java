package com.anodyzed.tripcheck.security.webauthn;

import jakarta.validation.Valid;

import com.anodyzed.tripcheck.model.User;
import com.anodyzed.tripcheck.security.webauthn.dto.AssertionFinishRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.AssertionStartRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.AuthResponse;
import com.anodyzed.tripcheck.security.webauthn.dto.RegistrationFinishRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.RegistrationStartRequest;
import com.anodyzed.tripcheck.services.UserService;

import java.util.HashMap;
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
  private final UserService userService;

  public WebAuthnController (WebAuthnService webAuthnService,UserService userService) {
    this.webAuthnService = webAuthnService;
    this.userService = userService;
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
    String username = authentication.getName();
    User user = userService.getUserByUsername(username);
    String displayName = (user != null && user.getDisplayName() != null && !user.getDisplayName().isBlank())
      ? user.getDisplayName()
      : username;

    Map<String,Object> response = new HashMap<>();
    response.put("authenticated",true);
    response.put("username",username);
    response.put("displayName",displayName);
    response.put("authorities",authentication.getAuthorities());
    return ResponseEntity.ok(response);
  } //getCurrentUser

} //*WebAuthnController
