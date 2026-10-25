package com.anodyzed.tripcheck.services;

import com.anodyzed.tripcheck.dto.UserSummaryDto;
import com.anodyzed.tripcheck.model.User;
import com.anodyzed.tripcheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

  private final UserRepository userRepository;

  @Transactional(readOnly=true)
  public List<UserSummaryDto> getAllUsers () {
    return userRepository.findAllByOrderByUsernameAsc().stream()
      .map(UserSummaryDto::fromEntity)
      .collect(Collectors.toList());
  } //getAllUsers

  public User getOrCreateUser (String username,String displayName) {
    if(username == null || username.isBlank()) {
      return null;
    }
    String normalized = username.trim().toLowerCase();
    return userRepository.findByUsernameIgnoreCase(normalized)
      .orElseGet(() -> userRepository.save(
        User.builder()
          .username(normalized)
          .displayName(displayName != null && !displayName.isBlank() ? displayName.trim() : normalized)
          .build()
      ));
  } //getOrCreateUser

  @Transactional(readOnly=true)
  public User getUserByUsername (String username) {
    if(username == null || username.isBlank()) {
      return null;
    }
    return userRepository.findByUsernameIgnoreCase(username.trim().toLowerCase()).orElse(null);
  } //getUserByUsername

} //*UserService
