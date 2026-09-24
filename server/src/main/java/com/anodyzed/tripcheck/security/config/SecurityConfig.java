package com.anodyzed.tripcheck.security.config;

import jakarta.servlet.http.HttpServletResponse;

import com.anodyzed.tripcheck.security.jwt.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final CorsConfigurationSource corsConfigurationSource;

  public SecurityConfig (JwtAuthenticationFilter jwtAuthenticationFilter,CorsConfigurationSource corsConfigurationSource) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.corsConfigurationSource = corsConfigurationSource;
  } //SecurityConfig

  @Bean
  public SecurityFilterChain securityFilterChain (HttpSecurity http) throws Exception {
    http
      .csrf(AbstractHttpConfigurer::disable)
      .cors(cors -> cors.configurationSource(corsConfigurationSource))
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint((request,response,authException) -> {
          response.setContentType("application/json");
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + authException.getMessage() + "\"}");
        })
      )
      .authorizeHttpRequests(auth -> auth
        .requestMatchers(
          "/api/auth/**",
          "/actuator/**",
          "/error"
        ).permitAll()
        .requestMatchers("/api/**").authenticated()
        .anyRequest().permitAll()
      )
      .addFilterBefore(jwtAuthenticationFilter,UsernamePasswordAuthenticationFilter.class);

    return http.build();
  } //securityFilterChain

} //*SecurityConfig
