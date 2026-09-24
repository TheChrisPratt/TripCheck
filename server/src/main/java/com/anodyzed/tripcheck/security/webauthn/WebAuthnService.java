package com.anodyzed.tripcheck.security.webauthn;

import com.anodyzed.tripcheck.security.jwt.JwtService;
import com.anodyzed.tripcheck.security.webauthn.dto.AssertionFinishRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.AssertionStartRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.AuthResponse;
import com.anodyzed.tripcheck.security.webauthn.dto.RegistrationFinishRequest;
import com.anodyzed.tripcheck.security.webauthn.dto.RegistrationStartRequest;
import com.anodyzed.tripcheck.util.exception.BadRequestException;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class WebAuthnService {

  private final JwtService jwtService;
  private final String rpId;
  private final String rpName;
  private final String origin;
  private final SecureRandom random = new SecureRandom();

  private final Map<String,String> registrationChallenges = new ConcurrentHashMap<>();
  private final Map<String,String> assertionChallenges = new ConcurrentHashMap<>();
  private final Map<String,List<String>> userCredentials = new ConcurrentHashMap<>();

  public WebAuthnService (
    JwtService jwtService,
    @Value("${app.webauthn.rp-id:localhost}") String rpId,
    @Value("${app.webauthn.rp-name:TripCheck}") String rpName,
    @Value("${app.webauthn.origin:http://localhost:4200}") String origin) {
    this.jwtService = jwtService;
    this.rpId = rpId;
    this.rpName = rpName;
    this.origin = origin;
  } //WebAuthnService

  private String generateBase64UrlChallenge () {
    byte[] challengeBytes = new byte[32];
    random.nextBytes(challengeBytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(challengeBytes);
  } //generateBase64UrlChallenge

  public Map<String,Object> startRegistration (RegistrationStartRequest request) {
    String username = request.getUsername().trim().toLowerCase();
    String challenge = generateBase64UrlChallenge();
    registrationChallenges.put(username,challenge);

    Map<String,Object> rp = new HashMap<>();
    rp.put("id",rpId);
    rp.put("name",rpName);

    Map<String,Object> user = new HashMap<>();
    user.put("id",Base64.getUrlEncoder().withoutPadding().encodeToString(username.getBytes()));
    user.put("name",username);
    user.put("displayName",request.getDisplayName() != null ? request.getDisplayName() : username);

    List<Map<String,Object>> pubKeyCredParams = new ArrayList<>();
    Map<String,Object> es256 = new HashMap<>();
    es256.put("type","public-key");
    es256.put("alg",-7); // ES256
    Map<String,Object> rs256 = new HashMap<>();
    rs256.put("type","public-key");
    rs256.put("alg",-257); // RS256
    pubKeyCredParams.add(es256);
    pubKeyCredParams.add(rs256);

    Map<String,Object> options = new HashMap<>();
    options.put("rp",rp);
    options.put("user",user);
    options.put("challenge",challenge);
    options.put("pubKeyCredParams",pubKeyCredParams);
    options.put("timeout",60000);
    options.put("attestation","none");

    return options;
  } //startRegistration

  public ResponseEntity<AuthResponse> finishRegistration (RegistrationFinishRequest request) {
    String username = request.getUsername().trim().toLowerCase();
    String challenge = registrationChallenges.remove(username);

    if(challenge == null) {
      throw new BadRequestException("Registration challenge expired or invalid for user: " + username);
    }

    String credentialId = request.getCredentialId();
    if(credentialId == null && request.getCredential() != null && request.getCredential().get("id") != null) {
      credentialId = String.valueOf(request.getCredential().get("id"));
    }
    if(credentialId == null || credentialId.isBlank()) {
      credentialId = UUID.randomUUID().toString();
    }

    userCredentials.computeIfAbsent(username,k -> new ArrayList<>()).add(credentialId);

    String token = jwtService.generateToken(username);
    ResponseCookie cookie = jwtService.generateAuthCookie(token);

    AuthResponse authResponse = AuthResponse.builder()
      .authenticated(true)
      .username(username)
      .token(token)
      .message("Registration successful")
      .build();

    return ResponseEntity.ok()
      .header(HttpHeaders.SET_COOKIE,cookie.toString())
      .body(authResponse);
  } //finishRegistration

  public Map<String,Object> startAssertion (AssertionStartRequest request) {
    String username = request.getUsername().trim().toLowerCase();
    String challenge = generateBase64UrlChallenge();
    assertionChallenges.put(username,challenge);

    Map<String,Object> options = new HashMap<>();
    options.put("challenge",challenge);
    options.put("timeout",60000);
    options.put("rpId",rpId);

    List<String> credIds = userCredentials.getOrDefault(username,Collections.emptyList());
    List<Map<String,Object>> allowCredentials = new ArrayList<>();
    for(String credId : credIds) {
      Map<String,Object> cred = new HashMap<>();
      cred.put("type","public-key");
      cred.put("id",credId);
      allowCredentials.add(cred);
    }
    options.put("allowCredentials",allowCredentials);

    return options;
  } //startAssertion

  public ResponseEntity<AuthResponse> finishAssertion (AssertionFinishRequest request) {
    String username = request.getUsername().trim().toLowerCase();
    String challenge = assertionChallenges.remove(username);

    if(challenge == null) {
      throw new BadRequestException("Authentication challenge expired or invalid for user: " + username);
    }

    String token = jwtService.generateToken(username);
    ResponseCookie cookie = jwtService.generateAuthCookie(token);

    AuthResponse authResponse = AuthResponse.builder()
      .authenticated(true)
      .username(username)
      .token(token)
      .message("Authentication successful")
      .build();

    return ResponseEntity.ok()
      .header(HttpHeaders.SET_COOKIE,cookie.toString())
      .body(authResponse);
  } //finishAssertion

  public ResponseEntity<Void> logout () {
    ResponseCookie cleanCookie = jwtService.generateCleanAuthCookie();
    return ResponseEntity.ok()
      .header(HttpHeaders.SET_COOKIE,cleanCookie.toString())
      .build();
  } //logout

} //*WebAuthnService
