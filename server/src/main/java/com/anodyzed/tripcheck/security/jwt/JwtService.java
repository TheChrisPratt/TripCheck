package com.anodyzed.tripcheck.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey secretKey;
  private final long expirationMs;
  private final String cookieName;

  public JwtService (
    @Value("${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret,
    @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
    @Value("${app.jwt.cookie-name:TRIPCHECK_TOKEN}") String cookieName) {
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
    this.cookieName = cookieName;
  } //JwtService

  public String generateToken (String username) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expirationMs);

    return Jwts.builder()
      .subject(username)
      .issuedAt(now)
      .expiration(expiryDate)
      .signWith(secretKey)
      .compact();
  } //generateToken

  public Optional<String> extractUsername (String token) {
    try {
      Claims claims = Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
      return Optional.ofNullable(claims.getSubject());
    } catch(JwtException | IllegalArgumentException e) {
      return Optional.empty();
    }
  } //extractUsername

  public boolean validateToken (String token) {
    try {
      Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token);
      return true;
    } catch(JwtException | IllegalArgumentException e) {
      return false;
    }
  } //validateToken

  public Optional<String> extractTokenFromRequest (HttpServletRequest request) {
    String authHeader = request.getHeader("Authorization");
    if(authHeader != null && authHeader.startsWith("Bearer ")) {
      return Optional.of(authHeader.substring(7));
    }

    if(request.getCookies() != null) {
      for(Cookie cookie : request.getCookies()) {
        if(cookieName.equals(cookie.getName())) {
          return Optional.ofNullable(cookie.getValue());
        }
      }
    }
    return Optional.empty();
  } //extractTokenFromRequest

  public ResponseCookie generateAuthCookie (String token) {
    return ResponseCookie.from(cookieName,token)
      .httpOnly(true)
      .secure(false) // Set to false for dev/http, configurable in production
      .sameSite("Strict")
      .path("/")
      .maxAge(expirationMs / 1000)
      .build();
  } //generateAuthCookie

  public ResponseCookie generateCleanAuthCookie () {
    return ResponseCookie.from(cookieName,"")
      .httpOnly(true)
      .secure(false)
      .sameSite("Strict")
      .path("/")
      .maxAge(0)
      .build();
  } //generateCleanAuthCookie

} //*JwtService
