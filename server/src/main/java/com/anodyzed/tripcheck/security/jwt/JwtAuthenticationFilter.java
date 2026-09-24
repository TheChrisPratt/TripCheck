package com.anodyzed.tripcheck.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  public JwtAuthenticationFilter (JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal (
    @NonNull HttpServletRequest request,
    @NonNull HttpServletResponse response,
    @NonNull FilterChain filterChain) throws ServletException, IOException {

    Optional<String> tokenOpt = jwtService.extractTokenFromRequest(request);

    if(tokenOpt.isPresent()) {
      String token = tokenOpt.get();
      Optional<String> usernameOpt = jwtService.extractUsername(token);

      if(usernameOpt.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
        String username = usernameOpt.get();
        if(jwtService.validateToken(token)) {
          List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
          UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            username,
            null,
            authorities
          );
          authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authToken);
        }
      }
    }

    filterChain.doFilter(request,response);
  } //doFilterInternal

} //*JwtAuthenticationFilter
