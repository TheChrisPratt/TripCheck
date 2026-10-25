package com.anodyzed.tripcheck.resources;

import com.anodyzed.tripcheck.dto.UserSummaryDto;
import com.anodyzed.tripcheck.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserResource {

  private final UserService userService;

  @GetMapping
  public ResponseEntity<List<UserSummaryDto>> getAllUsers () {
    return ResponseEntity.ok(userService.getAllUsers());
  } //getAllUsers

} //*UserResource
