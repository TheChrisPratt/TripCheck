package com.anodyzed.tripcheck.dto;

import com.anodyzed.tripcheck.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDto {

  private Long id;
  private String username;
  private String displayName;

  public static UserSummaryDto fromEntity (User user) {
    if(user == null) {
      return null;
    }
    return UserSummaryDto.builder()
      .id(user.getId())
      .username(user.getUsername())
      .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
      .build();
  } //fromEntity

} //*UserSummaryDto
