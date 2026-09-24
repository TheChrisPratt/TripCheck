package com.anodyzed.tripcheck.security.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

  @Value("${app.cors.allowed-origins:http://localhost:4200}")
  private String allowedOrigins;

  @Bean
  public CorsConfigurationSource corsConfigurationSource () {
    CorsConfiguration configuration = new CorsConfiguration();
    List<String> origins = Arrays.stream(allowedOrigins.split(","))
      .map(String::trim)
      .toList();
    configuration.setAllowedOrigins(origins);
    configuration.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization","Content-Type","X-Requested-With","Accept","Origin","Access-Control-Request-Method","Access-Control-Request-Headers"));
    configuration.setExposedHeaders(List.of("Set-Cookie","Authorization"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**",configuration);
    return source;
  } //corsConfigurationSource

} //*CorsConfig
