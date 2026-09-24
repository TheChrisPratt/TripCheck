package com.anodyzed.tripcheck.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.anodyzed.tripcheck.model.TaskStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskStatusRequest {

  @NotNull(message="Task status is required")
  private TaskStatus status;

} //*UpdateTaskStatusRequest
